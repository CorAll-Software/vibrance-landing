import { DESTINATIONS, MarketId } from './destinos.data';
import { PRODUCTS, ProductId } from './productos.data';

/**
 * Acceso fitosanitario por producto y mercado.
 *
 * Por qué existe: los primeros intentos de venta de la clienta fallaron por restricciones de
 * exportación. Un importador necesita saber, ANTES de cotizar, si el producto puede entrar a
 * su país. La web lo muestra con honestidad por producto y no promete mercados cerrados.
 *
 * TODO: dato real de la clienta — esta tabla es de EJEMPLO. Validar cada combinación con los
 * requisitos fitosanitarios de SENASA vigentes antes de publicar. Si un mercado no está en la
 * lista de un producto, la web muestra "Consultar".
 */
export const MARKET_ACCESS: Record<ProductId, MarketId[]> = {
  arandano: ['usa', 'canada', 'mexico', 'ue', 'reino_unido', 'china', 'corea'],
  palta: ['usa', 'canada', 'ue', 'reino_unido', 'china', 'corea', 'japon'],
  uva: ['usa', 'canada', 'mexico', 'ue', 'reino_unido', 'china', 'corea'],
  mango: ['usa', 'canada', 'ue', 'reino_unido', 'china', 'corea', 'japon'],
  mandarina: ['usa', 'canada', 'ue', 'reino_unido', 'china'],
  kion: ['usa', 'canada', 'ue', 'reino_unido'],
};

export const hasAccess = (product: ProductId, market: MarketId): boolean =>
  MARKET_ACCESS[product].includes(market);

/** Productos con acceso a un mercado (para el tooltip del mapa). */
export const productsForMarket = (market: MarketId): ProductId[] =>
  PRODUCTS.filter((p) => hasAccess(p.id, market)).map((p) => p.id);

/** Mercados con al menos un producto habilitado. */
export const MARKETS_WITH_ACCESS = DESTINATIONS.filter((m) => productsForMarket(m.id).length > 0);
