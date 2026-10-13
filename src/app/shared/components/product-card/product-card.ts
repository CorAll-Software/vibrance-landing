import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { Product } from '../../../data/productos.data';
import { PhotoPlaceholderComponent } from '../photo-placeholder/photo-placeholder';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';

/**
 * Card de producto. Hover/foco: zoom suave de la imagen, se revela el resumen
 * y, si hay video, se reproduce un loop corto. Clic: abre el detalle.
 */
@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, TranslocoDirective, PhotoPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <button
      type="button"
      class="card group relative block h-full min-h-[22rem] w-full overflow-hidden rounded-3xl bg-arena text-left text-niebla"
      *transloco="let t; prefix: 'productos'"
      [attr.aria-label]="t('viewDetail', { name: t('items.' + product().id + '.name') })"
      (click)="selected.emit(product())"
      (mouseenter)="play()"
      (mouseleave)="pause()"
      (focus)="play()"
      (blur)="pause()"
    >
      @if (product().placeholder) {
        <app-photo-placeholder class="card__media" />
      } @else {
        <img
          [ngSrc]="product().image"
          [alt]="t('items.' + product().id + '.alt')"
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          class="card__media object-cover"
        />
      }
      @if (product().video; as v) {
        <video
          #video
          class="card__media absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          muted
          loop
          playsinline
          preload="none"
          aria-hidden="true"
        >
          @if (v.webm) {
            <source [src]="v.webm" type="video/webm" />
          }
          @if (v.mp4) {
            <source [src]="v.mp4" type="video/mp4" />
          }
        </video>
      }
      <span
        class="absolute inset-0 bg-gradient-to-t from-palta/90 via-palta/20 to-transparent"
      ></span>

      <span class="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
        <span class="font-display text-2xl font-semibold leading-tight sm:text-4xl">
          {{ t('items.' + product().id + '.name') }}
        </span>
        <span class="card__reveal grid">
          <span class="overflow-hidden">
            <span class="block max-w-[36ch] text-base text-niebla/90">{{
              t('items.' + product().id + '.summary')
            }}</span>
            <span class="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-niebla/80">
              <span
                ><span class="font-semibold text-niebla">{{ t('varieties') }}:</span>
                {{ t('items.' + product().id + '.varieties') }}</span
              >
              <span
                ><span class="font-semibold text-niebla">{{ t('season') }}:</span>
                {{ t('items.' + product().id + '.season') }}</span
              >
            </span>
          </span>
        </span>
      </span>

      <span
        class="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-niebla/90 text-palta transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </span>
    </button>
  `,
  styles: `
    .card__media {
      transition: transform 700ms var(--ease-out-soft);
    }
    .card:hover .card__media,
    .card:focus-visible .card__media {
      transform: scale(1.06);
    }
    /* Revelado del resumen: grid-rows 0fr → 1fr (sin medir alturas) */
    .card__reveal {
      grid-template-rows: 0fr;
      opacity: 0;
      transition:
        grid-template-rows 350ms var(--ease-out-soft),
        opacity 250ms ease;
    }
    .card:hover .card__reveal,
    .card:focus-visible .card__reveal {
      grid-template-rows: 1fr;
      opacity: 1;
    }
    /* En pantallas táctiles no hay hover: el resumen siempre visible */
    @media (hover: none) {
      .card__reveal {
        grid-template-rows: 1fr;
        opacity: 1;
      }
    }
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly selected = output<Product>();

  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  private readonly scroll = inject(SmoothScrollService);

  protected play(): void {
    if (this.scroll.reducedMotion()) return;
    this.video()
      ?.nativeElement.play()
      .catch(() => {});
  }

  protected pause(): void {
    this.video()?.nativeElement.pause();
  }
}
