import type { ProductId } from './productos.data';

/**
 * Coordenadas (lat, lon) para los mapas.
 * TODO: dato real de la clienta — destinos y zonas de cultivo son de ejemplo.
 * Los nombres visibles viven en i18n `datos.destinos.<id>` y `origen.zonas.<id>`.
 */
export interface GeoPoint {
  id: string;
  lat: number;
  lon: number;
}

/** Mercados (un punto por mercado; la Unión Europea se muestra en Róterdam). */
export type MarketId =
  'usa' | 'canada' | 'mexico' | 'ue' | 'reino_unido' | 'china' | 'corea' | 'japon';

export const DESTINATIONS: (GeoPoint & { id: MarketId })[] = [
  { id: 'usa', lat: 39.5, lon: -98 },
  { id: 'canada', lat: 56, lon: -106 },
  { id: 'mexico', lat: 23.6, lon: -102.5 },
  { id: 'ue', lat: 51.9, lon: 4.5 },
  { id: 'reino_unido', lat: 54, lon: -2 },
  { id: 'china', lat: 35, lon: 104 },
  { id: 'corea', lat: 36.5, lon: 127.8 },
  { id: 'japon', lat: 36.2, lon: 138.2 },
];

/** Punto de salida (Perú) para las rutas del mapa mundial. */
export const ORIGIN: GeoPoint = { id: 'peru', lat: -9.2, lon: -75 };

/**
 * Regiones de origen de los productores con los que se trabaja (mapa del Perú).
 * La empresa no cultiva: son zonas de abastecimiento.
 */
export type PortId = 'paita' | 'callao';

export interface GrowingZone extends GeoPoint {
  /** Frutas que se compran en la región; la primera es la principal (ícono y foto). */
  fruits: ProductId[];
  /** Puerto de embarque habitual (línea punteada del mapa). */
  port: PortId;
}

export const GROWING_ZONES: GrowingZone[] = [
  { id: 'piura', lat: -5.05, lon: -80.25, fruits: ['mango', 'uva'], port: 'paita' },
  { id: 'la_libertad', lat: -8.0, lon: -78.75, fruits: ['arandano', 'palta'], port: 'paita' },
  { id: 'lima', lat: -11.3, lon: -76.8, fruits: ['mandarina', 'palta'], port: 'callao' },
  { id: 'junin', lat: -11.2, lon: -75.0, fruits: ['kion', 'mandarina'], port: 'callao' },
  { id: 'ica', lat: -14.1, lon: -75.7, fruits: ['uva', 'palta', 'mandarina'], port: 'callao' },
];

/** Puertos de embarque de la fruta. */
export const PORTS: (GeoPoint & { id: PortId })[] = [
  { id: 'paita', lat: -5.08, lon: -81.11 },
  { id: 'callao', lat: -12.05, lon: -77.15 },
];
