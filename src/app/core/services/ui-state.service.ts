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
}
