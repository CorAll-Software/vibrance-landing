import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective, translateSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { HERO_MEDIA } from '../../data/media.data';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { UiStateService } from '../../core/services/ui-state.service';

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.html',
  styles: `
    .scroll-cue span {
      animation: cue 1.8s var(--ease-out-soft) infinite;
    }
    @keyframes cue {
      0% {
        transform: translateY(-100%);
      }
      60%,
      100% {
        transform: translateY(100%);
      }
    }
  `,
})
export class HeroComponent {
  protected readonly media = HERO_MEDIA;
  protected readonly ui = inject(UiStateService);
  private readonly scroll = inject(SmoothScrollService);

  /** El titular se divide en palabras para la entrada palabra por palabra. */
  private readonly title = translateSignal('hero.title');
  protected readonly words = computed(() => this.title().split(' '));

  /** En móvil se muestra la imagen en lugar del video. */
  protected readonly showVideo = signal(false);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;
    const ready = signal(false);
    let played = false;

    afterNextRender(() => {
      this.showVideo.set(
        !!(this.media.webm || this.media.mp4) &&
          window.matchMedia('(min-width: 768px)').matches &&
          !this.scroll.reducedMotion(),
      );
      ready.set(true);
      if (!this.scroll.reducedMotion() && !this.ui.introDone()) {
        // Estado inicial oculto mientras dura el loader
        gsap.set(host.querySelectorAll('.word, .hero-fade'), { opacity: 0 });
      }
    });

    // Entrada del hero: espera a que termine el loader (una sola vez)
    effect(() => {
      if (!this.ui.introDone() || played || !ready()) return;
      played = true;
      if (this.scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          gsap
            .timeline({ defaults: { ease: 'power4.out' } })
            .fromTo(
              '.word',
              { yPercent: 105, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
            )
            .fromTo(
              '.hero-fade',
              { y: 16, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
              '-=0.45',
            );
          // Parallax leve del fondo al salir del hero
          gsap.to('.hero-bg', {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: host, start: 'top top', end: 'bottom top', scrub: true },
          });
        }, host);
      });
    });

    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  protected goToProducts(event: Event): void {
    event.preventDefault();
    this.scroll.scrollTo('#productos');
  }

  protected goNext(): void {
    this.scroll.scrollTo('#origen');
  }
}
