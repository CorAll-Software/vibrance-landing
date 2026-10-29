import { Injectable, signal } from '@angular/core';
import { ProductId } from '../../data/productos.data';

/** Estado global de UI: loader y modal de cotización. */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  /** true cuando el loader terminó (o no se mostró). La entrada del hero espera esto. */
  readonly introDone = signal(false);

  readonly quoteOpen = signal(false);
  /** Producto preseleccionado al abrir la cotización desde una card. */
  readonly quoteProduct = signal<ProductId | ''>('');

  openQuote(product: ProductId | '' = ''): void {
    this.quoteProduct.set(product);
    this.quoteOpen.set(true);
  }

  closeQuote(): void {
    this.quoteOpen.set(false);
  }

  readonly privacyOpen = signal(false);

  openPrivacy(): void {
    this.privacyOpen.set(true);
  }

  closePrivacy(): void {
    this.privacyOpen.set(false);
  }

  /** Producto abierto en el modal de detalle (catálogo y mapa de Origen). */
  readonly productDetail = signal<ProductId | null>(null);

  openProduct(product: ProductId): void {
    this.productDetail.set(product);
  }

  closeProduct(): void {
    this.productDetail.set(null);
  }
}
