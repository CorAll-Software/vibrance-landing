import { signal } from '@preact/signals';
import type { ProductId } from '../data/productos.data';

/** Estado global de UI: loader y modales. */

/** true cuando el loader terminó (o no se mostró). La entrada del hero espera esto. */
export const introDone = signal(false);
/**
 * true cuando la mariposa del loader despega de la semilla. El video del hero arranca
 * aquí, para que al disolverse el loader ya se vea el campo en movimiento.
 */
export const introFlight = signal(false);

export const quoteOpen = signal(false);
/** Producto preseleccionado al abrir la cotización desde una card. */
export const quoteProduct = signal<ProductId | ''>('');

export function openQuote(product: ProductId | '' = ''): void {
  quoteProduct.value = product;
  quoteOpen.value = true;
}
export function closeQuote(): void {
  quoteOpen.value = false;
}

export const privacyOpen = signal(false);
export function openPrivacy(): void {
  privacyOpen.value = true;
}
export function closePrivacy(): void {
  privacyOpen.value = false;
}

/** Producto abierto en el modal de detalle (catálogo y mapa de Origen). */
export const productDetail = signal<ProductId | null>(null);
export function openProduct(product: ProductId): void {
  productDetail.value = product;
}
export function closeProduct(): void {
  productDetail.value = null;
}
