import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { PRODUCTS, Product, ProductId } from '../../../data/productos.data';
import { MARKET_ACCESS } from '../../../data/mercados.data';
import { UiStateService } from '../../../core/services/ui-state.service';
import { ModalComponent } from '../modal/modal';
import { PhotoPlaceholderComponent } from '../photo-placeholder/photo-placeholder';
import { AvailabilityCalendarComponent } from '../availability-calendar/availability-calendar';

/**
 * Modal de detalle de un producto (variedades, calibres, mercados, calendario y cotización).
 * Uno solo para toda la página: lo abren las tarjetas del catálogo y las frutas del mapa de
 * Origen con `UiStateService.openProduct(id)`.
 *
 * Responsive: en móvil la foto va arriba (banda baja) y el contenido debajo; desde `lg` la foto
 * queda a la izquierda, fija mientras se recorre el contenido a la derecha.
 */
@Component({
  selector: 'app-product-detail',
  imports: [
    NgOptimizedImage,
    TranslocoDirective,
    ModalComponent,
    PhotoPlaceholderComponent,
    AvailabilityCalendarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [open]="!!ui.productDetail()"
      size="wide"
      labelledBy="product-title"
      (closed)="ui.closeProduct()"
    >
      @if (detail(); as p) {
        <div class="detail" *transloco="let t; prefix: 'productos'">
          <div class="detail__media bg-arena">
            @if (p.placeholder) {
              <app-photo-placeholder />
            } @else {
              <img
                [ngSrc]="p.image"
                [alt]="t('items.' + p.id + '.alt')"
                fill
                sizes="(min-width: 1024px) 32rem, 100vw"
                class="object-cover"
              />
            }
          </div>
          <div class="detail__body">
            <h2 id="product-title" class="detail__title pe-12 text-3xl font-bold sm:text-4xl">
              {{ t('items.' + p.id + '.name') }}
            </h2>
            <p class="detail__summary mt-2 text-base text-palta/75 sm:text-lg">
              {{ t('items.' + p.id + '.summary') }}
            </p>

            <dl class="detail__facts mt-6 grid gap-x-8 gap-y-4 sm:mt-8 sm:grid-cols-2 sm:gap-y-5">
              <div>
                <dt class="text-sm font-semibold text-palta/60">{{ t('varieties') }}</dt>
                <dd class="mt-1">{{ t('items.' + p.id + '.varieties') }}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-palta/60">{{ t('sizes') }}</dt>
                <dd class="mt-1">{{ p.sizes.join(' · ') }}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-palta/60">{{ t('presentations') }}</dt>
                <dd class="mt-1">{{ t('items.' + p.id + '.presentations') }}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-palta/60">{{ t('packaging') }}</dt>
                <dd class="mt-1">{{ t('items.' + p.id + '.packaging') }}</dd>
              </div>
            </dl>
            <p class="detail__note mt-5 text-sm text-palta/70">{{ t('quoteNote') }}</p>

            <div class="detail__block mt-6 border-t border-palta/15 pt-5 sm:mt-8 sm:pt-6">
              <h3 class="font-sans text-sm font-semibold text-palta/60">{{ t('markets') }}</h3>
              <p class="mt-1">{{ marketNames(p.id) }}</p>
              <p class="mt-1 text-sm text-palta/60">{{ t('marketsNote') }}</p>
            </div>

            <div class="detail__block mt-6 border-t border-palta/15 pt-5 sm:mt-8 sm:pt-6">
              <h3 class="font-sans text-sm font-semibold text-palta/60">
                {{ t('availability') }} · {{ t('items.' + p.id + '.season') }}
              </h3>
              <div class="mt-4">
                <app-availability-calendar [months]="p.months" />
              </div>
            </div>

            <button
              type="button"
              class="detail__cta btn-primary mt-8 w-full sm:mt-10 sm:w-auto"
              (click)="quote(p)"
            >
              {{ t('quoteThis', { name: t('items.' + p.id + '.name') }) }}
            </button>
          </div>
        </div>
      }
    </app-modal>
  `,
  styles: `
    /* Móvil y tablet: foto arriba en banda, contenido debajo */
    .detail__media {
      position: relative;
      aspect-ratio: 16 / 9;
      max-height: 34svh;
      width: 100%;
    }
    .detail__body {
      padding: 1.5rem 1.25rem 1.75rem;
    }
    @media (min-width: 640px) {
      .detail__media {
        aspect-ratio: 21 / 9;
      }
      .detail__body {
        padding: 2rem 2.5rem 2.5rem;
      }
    }
    /*
     * Escritorio y laptops: dos columnas y todo a la vista sin scroll. Los datos van en una
     * fila de 4 y los tamaños y espacios se ajustan a la altura de la pantalla (svh).
     */
    @media (min-width: 1024px) {
      .detail {
        display: grid;
        grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
      }
      .detail__media {
        aspect-ratio: auto;
        height: auto;
        max-height: none;
        min-height: 100%;
      }
      .detail__body {
        padding: clamp(1.25rem, 3.5svh, 2.5rem) clamp(1.5rem, 2.5vw, 2.5rem);
      }
      .detail__title {
        font-size: clamp(1.75rem, 4.5svh, 2.25rem);
      }
      .detail__summary {
        margin-top: 0.25rem;
        font-size: 1rem;
      }
      .detail__facts {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        column-gap: 1.25rem;
        margin-top: clamp(0.75rem, 2.5svh, 1.5rem);
        font-size: 0.9375rem;
        line-height: 1.35;
      }
      .detail__note {
        margin-top: clamp(0.5rem, 1.5svh, 1rem);
        font-size: 0.8125rem;
      }
      .detail__block {
        margin-top: clamp(0.75rem, 2.2svh, 1.5rem);
        padding-top: clamp(0.75rem, 2.2svh, 1.25rem);
        font-size: 0.9375rem;
      }
      .detail__cta {
        margin-top: clamp(1rem, 3svh, 2rem);
      }
    }
    /* Laptops muy bajas (p. ej. 1366×768 con escala al 125 %): un poco más compacto */
    @media (min-width: 1024px) and (max-height: 620px) {
      .detail__title {
        font-size: 1.5rem;
      }
      .detail__summary,
      .detail__facts,
      .detail__block {
        font-size: 0.875rem;
      }
    }
  `,
})
export class ProductDetailComponent {
  protected readonly ui = inject(UiStateService);
  private readonly transloco = inject(TranslocoService);

  /** Se conserva el último producto para que el contenido no desaparezca al cerrar. */
  private readonly last = signal<Product | null>(null);
  protected readonly detail = computed(() => {
    const id = this.ui.productDetail();
    return id ? PRODUCTS.find((p) => p.id === id)! : this.last();
  });

  constructor() {
    effect(() => {
      const id = this.ui.productDetail();
      if (id) this.last.set(PRODUCTS.find((p) => p.id === id)!);
    });
  }

  /** Mercados con protocolo vigente para el producto, ya traducidos. */
  protected marketNames(id: ProductId): string {
    return MARKET_ACCESS[id].map((m) => this.transloco.translate('datos.destinos.' + m)).join(', ');
  }

  protected quote(product: Product): void {
    this.ui.closeProduct();
    // Espera a que el modal de detalle se cierre antes de abrir la cotización
    setTimeout(() => this.ui.openQuote(product.id), 50);
  }
}
