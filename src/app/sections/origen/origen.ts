import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective, translateObjectSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ORIGEN } from '../../core/config/media.config';
import { GROWING_ZONES } from '../../data/destinos.data';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { MapPeruComponent } from '../../shared/components/map-peru/map-peru';

/**
 * Origen: la historia se revela línea por línea con el scroll (scrub suave),
 * foto con parallax leve y mapa del Perú con las zonas de cultivo.
 */
@Component({
  selector: 'app-origen',
  imports: [NgOptimizedImage, TranslocoDirective, MapPeruComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './origen.html',
})
export class OrigenComponent {
  protected readonly media = ORIGEN;
  protected readonly zones = GROWING_ZONES;
  protected readonly scroll = inject(SmoothScrollService);
  protected readonly lines = translateObjectSignal('origen.lines') as unknown as () => string[];

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const scroll = this.scroll;
    let ctx: gsap.Context | undefined;
    let io: IntersectionObserver | undefined;

    afterNextRender(() => {
      // Video opcional: solo se descarga y reproduce mientras está a la vista
      const video = host.querySelector<HTMLVideoElement>('.origen-frame video');
      if (video) {
        io = new IntersectionObserver(
          ([e]) => (e.isIntersecting ? video.play().catch(() => {}) : video.pause()),
          { threshold: 0.25 },
        );
        io.observe(video);
      }
      if (scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          // Cada línea pasa de tenue a plena conforme avanza el scroll
          gsap.fromTo(
            '.story-line',
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: 'none',
              stagger: 0.5,
              scrollTrigger: { trigger: '.story', start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
            },
          );
          // Parallax leve de la foto dentro de su marco
          gsap.fromTo(
            '.origen-photo',
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: '.origen-frame',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        }, host);
      });
    });
    inject(DestroyRef).onDestroy(() => {
      ctx?.revert();
      io?.disconnect();
    });
  }
}
