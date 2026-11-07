import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { PRODUCTS, ProductId } from '../../data/productos.data';
import { UiStateService } from '../../core/services/ui-state.service';
import { PhotoPlaceholderComponent } from '../../shared/components/photo-placeholder/photo-placeholder';

/**
 * Qué ofrecemos: paneles que se expanden. La fruta activa se ensancha y muestra su información;
 * al hacer clic en ella se abre el detalle (app-product-detail, compartido con el mapa de Origen).
 * En pantallas táctiles el primer toque abre el panel y el segundo, el detalle.
 */
@Component({
  selector: 'app-productos',
  imports: [NgOptimizedImage, TranslocoDirective, PhotoPlaceholderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ProductosComponent {
  protected readonly products = PRODUCTS;
  protected readonly ui = inject(UiStateService);
  /** Panel abierto (por defecto, el primero). */
  protected readonly active = signal(0);
  /** true mientras el cursor está sobre los paneles: el clic abre directo el detalle. */
  protected hovering = false;
  /** true entre pointerdown y click: el foco de un toque no debe contar como "ya abierto". */
  protected pressing = false;

  /** Solo el mouse abre al pasar (en táctil el navegador emula eventos de cursor). */
  protected hover(i: number, event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    this.hovering = true;
    this.active.set(i);
  }

  /** Teclado: al llegar con Tab se abre el panel. */
  protected focused(i: number): void {
    if (!this.pressing) this.active.set(i);
  }

  /** Clic: si el panel ya está abierto (o se llegó con el cursor), abre el detalle. */
  protected choose(i: number, id: ProductId): void {
    this.pressing = false;
    if (this.active() === i || this.hovering) {
      this.active.set(i);
      this.ui.openProduct(id);
    } else {
      this.active.set(i);
    }
  }
}
