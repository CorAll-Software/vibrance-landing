import { PhotoPlaceholderComponent } from '../../shared/components/photo-placeholder/photo-placeholder';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { PRODUCTS, Product, ProductId } from '../../data/productos.data';
import { MARKET_ACCESS } from '../../data/mercados.data';
import { UiStateService } from '../../core/services/ui-state.service';
import { ModalComponent } from '../../shared/components/modal/modal';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar';

/** Qué ofrecemos: cards por fruta + modal de detalle con calendario de disponibilidad. */
@Component({
  selector: 'app-productos',
  imports: [
    NgOptimizedImage,
    TranslocoDirective,
    ModalComponent,
    ProductCardComponent,
    PhotoPlaceholderComponent,
    AvailabilityCalendarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productos.html',
})
export class ProductosComponent {
  protected readonly products = PRODUCTS;
  private readonly ui = inject(UiStateService);
  private readonly transloco = inject(TranslocoService);

  protected readonly selected = signal<Product | null>(null);
  /** Se conserva el último producto para que el contenido no desaparezca durante la animación de cierre. */
  private readonly lastSelected = signal<Product | null>(null);
  protected readonly detail = computed(() => this.selected() ?? this.lastSelected());

  /** Composición asimétrica: la primera card es alta; las tres últimas comparten fila (escritorio). */
  protected readonly layout = [
    'lg:col-span-5 lg:row-span-2 min-h-[26rem] lg:min-h-[44rem]',
    'lg:col-span-7 min-h-[22rem]',
    'lg:col-span-7 min-h-[22rem]',
    'lg:col-span-4 min-h-[22rem] lg:min-h-[26rem]',
    'lg:col-span-4 min-h-[22rem] lg:min-h-[26rem]',
    'lg:col-span-4 min-h-[22rem] lg:min-h-[26rem]',
  ];

  /** Mercados con protocolo vigente para el producto, ya traducidos. */
  protected marketNames(id: ProductId): string {
    return MARKET_ACCESS[id].map((m) => this.transloco.translate('datos.destinos.' + m)).join(', ');
  }

  protected open(product: Product): void {
    this.lastSelected.set(product);
    this.selected.set(product);
  }

  protected close(): void {
    this.selected.set(null);
  }

  protected quote(product: Product): void {
    this.close();
    // Espera a que el modal de detalle se cierre antes de abrir la cotización
    setTimeout(() => this.ui.openQuote(product.id), 50);
  }
}
