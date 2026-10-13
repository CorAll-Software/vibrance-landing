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
import { MOMENT_DURATION, SCENE_MODE } from '../../core/config/scroll.config';

/** Debe coincidir con la media query de proceso.css */
const HORIZONTAL_MQ = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/**
 * Proceso ⭐ momento memorable.
 * Escritorio: la sección se fija (pin) y el scroll vertical desplaza las etapas en horizontal.
 * Cómo avanza se elige en core/config/scroll.config.ts (SCENE_MODE): 'momentos' (cada etapa
 * se desliza completa al cruzar un punto), 'pausas' (avanza con el scroll y se detiene en
 * cada etapa) o 'libre' (sin parte fija: las etapas van en vertical y entran al pasar).
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

          if (SCENE_MODE === 'momentos') {
            // Al cruzar cada tramo de la parte fija, el carril se desliza completo a la etapa
            let current = 0;
            const goTo = (i: number, duration = MOMENT_DURATION * 0.8) =>
              gsap.to(track, {
                x: -distance() * (i / last),
                duration,
                ease: 'power2.inOut',
                overwrite: true,
                onUpdate: update,
              });
            ScrollTrigger.create({
              trigger: host.querySelector('.pin'),
              start: 'top top',
              end: () => `+=${window.innerHeight * 0.75 * last}`,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: () => goTo(current, 0),
              onUpdate: (self) => {
                const target = Math.round(self.progress * last);
                if (target === current) return;
                current = target;
                goTo(target);
              },
            });
            return;
          }

          // 'pausas': avanza con el scroll (amortiguado) y se detiene en cada etapa
          const MOVE = 1; // tramo en que se pasa de una etapa a la siguiente
          const HOLD = 0.6; // pausa en cada etapa
          const tl = gsap.timeline({
            defaults: { ease: 'power1.inOut' },
            scrollTrigger: {
              trigger: host.querySelector('.pin'),
              start: 'top top',
              // Más largo que el recorrido para dar espacio a las pausas
              end: () => `+=${distance() * ((last * (MOVE + HOLD) + HOLD) / last)}`,
              pin: true,
              scrub: 1.2, // avance amortiguado
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
            onUpdate: update,
          });
          tl.to({}, { duration: HOLD / 2 }); // pausa en la etapa 01
          for (let i = 1; i <= last; i++) {
            tl.to(track, { x: () => -distance() * (i / last), duration: MOVE }).to(
              {},
              { duration: i === last ? HOLD / 2 : HOLD },
            );
          }
        });
      });
    });
    inject(DestroyRef).onDestroy(() => {
      mm?.revert();
      io?.disconnect();
    });
  }
}
