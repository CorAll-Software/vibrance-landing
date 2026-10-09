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
import { PROCESS_STEPS } from '../../data/proceso.data';
import { LanguageService } from '../../core/services/language.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

/** Debe coincidir con la media query de proceso.css */
const HORIZONTAL_MQ = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/**
 * Proceso ⭐ momento memorable.
 * Escritorio: la sección se fija (pin) y el scroll vertical desplaza las etapas en horizontal.
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

        mm = gsap.matchMedia(host);
        mm.add(HORIZONTAL_MQ, () => {
          const track = host.querySelector<HTMLElement>('.track')!;
          const distance = () => track.scrollWidth - track.clientWidth;
          const last = this.steps.length - 1;

          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: host.querySelector('.pin'),
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set('.progress-fill', { scaleX: self.progress });
                const i = Math.min(last, Math.round(self.progress * last));
                if (i !== this.active()) this.active.set(i);
              },
            },
          });
        });
      });
    });
    inject(DestroyRef).onDestroy(() => {
      mm?.revert();
      io?.disconnect();
    });
  }
}
