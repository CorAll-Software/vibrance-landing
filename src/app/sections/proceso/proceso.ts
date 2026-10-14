import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROCESS_STEPS } from '../../data/proceso.data';
import { LanguageService } from '../../core/services/language.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { SCENE_MODE } from '../../core/config/scroll.config';

/** Debe coincidir con la media query de proceso.css */
const HORIZONTAL_MQ = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
/** Segundos que tarda el carril en llegar a una etapa. */
const STEP_DURATION = 0.7;

/**
 * Proceso ⭐ momento memorable.
 * Escritorio: la sección se fija (pin) y el scroll vertical desplaza las etapas en horizontal.
 * Avanza por momentos: cada etapa se desliza completa al cruzar un punto del scroll, y las
 * pestañas de arriba llevan directo a cualquier etapa. Con SCENE_MODE 'libre'
 * (core/config/scroll.config.ts) no hay parte fija: las etapas van en vertical.
 * Móvil o movimiento reducido: línea de tiempo vertical, sin pin.
 */
@Component({
  selector: 'app-proceso',
  imports: [NgOptimizedImage, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proceso.html',
  styleUrl: './proceso.css',
})
export class ProcesoComponent {
  /** Recorrido horizontal con parte fija (no se usa en el modo 'libre'). */
  protected readonly horizontal = SCENE_MODE !== 'libre';
  /** Lleva el carril a una etapa (lo define la escena fija; sin ella las pestañas no actúan). */
  private goToStep?: (i: number) => void;

  /** Pestañas de etapas: se mueve a la elegida. */
  protected select(i: number): void {
    this.goToStep?.(i);
  }
  protected readonly steps = PROCESS_STEPS;
  protected readonly active = signal(0);
  protected readonly lang = inject(LanguageService);
  protected readonly scroll = inject(SmoothScrollService);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let mm: gsap.MatchMedia | undefined;
    let io: IntersectionObserver | undefined;

    afterNextRender(() => {
      zone.runOutsideAngular(() => {
        // Videos de las etapas: solo se descargan y reproducen cuando están a la vista
        io = new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              const v = e.target as HTMLVideoElement;
              if (e.isIntersecting) v.play().catch(() => {});
              else v.pause();
            }),
          { threshold: 0.35 },
        );
        host.querySelectorAll<HTMLVideoElement>('.step-video').forEach((v) => io!.observe(v));

        if (!this.horizontal) return;
        mm = gsap.matchMedia(host);
        mm.add(HORIZONTAL_MQ, () => {
          const track = host.querySelector<HTMLElement>('.track')!;
          const distance = () => track.scrollWidth - track.clientWidth;
          const last = this.steps.length - 1;

          const update = () => {
            const f = Math.min(1, -Number(gsap.getProperty(track, 'x')) / (distance() || 1));
            gsap.set('.progress-fill', { scaleX: f });
            const i = Math.min(last, Math.round(f * last));
            if (i !== this.active()) this.active.set(i);
          };

          // Por momentos: al cruzar cada tramo de la parte fija, el carril se desliza completo
          // a la etapa. Las pestañas de arriba llevan directo a cualquier etapa.
          let current = 0;
          const goTo = (i: number, duration = STEP_DURATION) =>
            gsap.to(track, {
              x: -distance() * (i / last),
              duration,
              ease: 'power3.out', // arranca al instante y frena suave
              overwrite: true,
              onUpdate: update,
            });
          const st = ScrollTrigger.create({
            trigger: host.querySelector('.pin'),
            start: 'top top',
            end: () => `+=${window.innerHeight * 0.75 * last}`,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => goTo(current, 0),
            // Al pasar la última etapa hacia abajo, la sección se suelta (ver release)
            onLeave: () => release(),
            onUpdate: (self) => {
              // Mientras una pestaña lleva a su etapa, el scroll no cambia de momento
              if (this.scroll.autoScrolling) return;
              // Basta con entrar un poco (20 %) en el tramo siguiente para cambiar de etapa
              const f = self.progress * last;
              const target =
                self.direction > 0
                  ? Math.min(last, Math.floor(f + 0.8))
                  : Math.max(0, Math.ceil(f - 0.8));
              if (target === current) return;
              current = target;
              goTo(target);
            },
          });
          /**
           * Una sola vez, como en Origen y Nosotros: tras pasar "Documentación y envío" la parte
           * fija se suelta. Al volver a subir, la sección queda quieta en la última etapa y solo
           * las pestañas mueven el carril.
           */
          let released = false;
          const release = () => {
            if (released) return;
            released = true;
            const distance = st.end - st.start;
            st.kill();
            // Se quita el tramo fijo sin que se note el salto
            this.scroll.shiftBy(-distance);
            ScrollTrigger.refresh();
          };
          this.goToStep = (i: number) => {
            if (i === current) return;
            current = i;
            goTo(i);
            // Mientras está fija, la página se acomoda en el tramo de esa etapa
            // (la última queda justo antes del final: solo el scroll del usuario suelta la sección)
            if (!released) {
              const y = st.start + (st.end - st.start) * (i / last);
              this.scroll.scrollToY(Math.min(y, st.end - 4), STEP_DURATION);
            }
          };
          return () => (this.goToStep = undefined);
        });
      });
    });
    inject(DestroyRef).onDestroy(() => {
      mm?.revert();
      io?.disconnect();
    });
  }
}
