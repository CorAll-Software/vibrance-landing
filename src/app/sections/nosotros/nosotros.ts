import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { TranslocoDirective, translateSignal } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { ButterflyComponent } from '../../shared/components/butterfly/butterfly';
import { PhotoPlaceholderComponent } from '../../shared/components/photo-placeholder/photo-placeholder';

gsap.registerPlugin(ScrollTrigger);

/**
 * Quiénes somos: la CEO, su trayectoria y el mensaje de respaldo legal y asegurado.
 * Cierra con la frase de la marca a todo el ancho: sus palabras pasan de tenues a plenas con el
 * scroll y, al completarse, aparece la mariposa amarilla.
 */
@Component({
  selector: 'app-nosotros',
  imports: [TranslocoDirective, PhotoPlaceholderComponent, ButterflyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="nosotros"
      class="bg-niebla py-24 md:py-36"
      aria-labelledby="nosotros-title"
      *transloco="let t; prefix: 'nosotros'"
    >
      <div class="container-page grid gap-14 lg:grid-cols-12">
        <div class="lg:col-span-6">
          <p data-reveal class="text-sm font-semibold tracking-wide text-hoja uppercase">
            {{ t('kicker') }}
          </p>
          <h2
            data-reveal
            id="nosotros-title"
            class="mt-4 text-4xl leading-[1.05] font-bold md:text-6xl"
          >
            {{ t('heading') }}
          </h2>
          <p data-reveal class="measure mt-8 text-lg text-palta/80">{{ t('bio') }}</p>
          <p data-reveal class="mt-6 font-display text-xl font-semibold text-palta">
            {{ ceoName }}
            <span class="block text-base font-medium text-palta/70">{{ t('role') }}</span>
          </p>

          <ul data-reveal class="mt-10 grid gap-4">
            @for (k of pillars; track k) {
              <li class="flex gap-4 border-t border-palta/15 pt-4">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  aria-hidden="true"
                  class="mt-0.5 shrink-0 text-hoja"
                >
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="text-palta/85">{{ t('pillars.' + k) }}</span>
              </li>
            }
          </ul>
        </div>

        <div class="lg:col-span-5 lg:col-start-8">
          <!-- TODO: foto real de la CEO -->
          <div
            data-reveal
            class="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-arena"
          >
            <app-photo-placeholder [caption]="ceoName" />
          </div>
          <div data-reveal class="mt-8 grid gap-5 text-palta/80">
            <h3 class="text-2xl font-semibold text-palta md:text-3xl">{{ t('storyTitle') }}</h3>
            @for (k of story; track k) {
              <p>{{ t('story.' + k) }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Frase de la marca: cada palabra se llena con el scroll -->
      <figure class="quote-band container-page" #band [style.--n]="words().count">
        <blockquote>
          <p class="quote-text font-display font-bold" [attr.aria-label]="t('quote')">
            @for (w of words().parts; track $index) {
              <span class="qw" [class.qw--space]="w.i < 0" [style.--i]="w.i" aria-hidden="true">{{
                w.text
              }}</span>
            }
          </p>
        </blockquote>
        <app-butterfly class="quote-bf" />
      </figure>
    </section>
  `,
  styles: `
    .quote-band {
      position: relative;
      margin-top: 7rem;
      padding-top: 4.5rem;
      border-top: 1px solid rgb(30 59 47 / 0.15);
      text-align: center;
      --p: 1; /* avance del scroll (0–1); sin animación queda completa */
    }
    .quote-text {
      max-width: 20ch;
      margin-inline: auto;
      font-size: clamp(2.4rem, 6vw, 5.25rem);
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--color-palta);
    }
    /* Cada palabra pasa de tenue a plena según el avance (n = palabras, i = posición) */
    .qw {
      opacity: clamp(0.14, calc(var(--p) * (var(--n) + 3) - var(--i)), 1);
      transition: opacity 0.15s linear;
    }
    .qw--space {
      opacity: 1;
    }
    /* La mariposa llega cuando la frase está completa */
    .quote-bf {
      display: block;
      width: 3.25rem;
      margin: 2rem auto 0;
      opacity: clamp(0, calc(var(--p) * 7 - 6), 1);
      transform: translateY(calc((1 - clamp(0, calc(var(--p) * 7 - 6), 1)) * -2.5rem))
        rotate(calc((1 - clamp(0, calc(var(--p) * 7 - 6), 1)) * 25deg));
    }
  `,
})
export class NosotrosComponent {
  protected readonly ceoName = 'Melanie Calderon';
  protected readonly pillars = ['contracts', 'insurance', 'credit'] as const;
  protected readonly story = ['p1', 'p2', 'p3'] as const;

  private readonly quote = translateSignal('nosotros.quote');
  /**
   * La frase dividida en palabras (Intl.Segmenter también separa chino y japonés).
   * `i` es la posición de cada palabra; los espacios llevan -1.
   */
  protected readonly words = computed(() => {
    const text = this.quote();
    let i = 0;
    const seg =
      typeof Intl !== 'undefined' && 'Segmenter' in Intl
        ? [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)]
        : text.split(/(\s+)/).map((segment) => ({ segment, isWordLike: /\S/.test(segment) }));
    // Los signos (punto, coma…) aparecen junto con la palabra anterior; los espacios no cuentan
    const parts = seg.map((s) => ({
      text: s.segment,
      i: s.isWordLike ? i++ : /\S/.test(s.segment) ? Math.max(0, i - 1) : -1,
    }));
    return { parts, count: i };
  });

  private readonly band = viewChild.required<ElementRef<HTMLElement>>('band');

  constructor() {
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let st: ScrollTrigger | undefined;
    afterNextRender(() => {
      if (scroll.reducedMotion()) return;
      const band = this.band().nativeElement;
      zone.runOutsideAngular(() => {
        band.style.setProperty('--p', '0');
        st = ScrollTrigger.create({
          trigger: band,
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: 0.4,
          onUpdate: (self) => band.style.setProperty('--p', self.progress.toFixed(3)),
        });
      });
    });
    inject(DestroyRef).onDestroy(() => st?.kill());
  }
}
