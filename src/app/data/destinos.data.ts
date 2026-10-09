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
export const GROWING_ZONES: GeoPoint[] = [
  { id: 'piura', lat: -5.0, lon: -80.6 },
  { id: 'la_libertad', lat: -8.2, lon: -78.9 },
  { id: 'lima', lat: -11.5, lon: -77.2 },
  { id: 'junin', lat: -11.1, lon: -75.3 },
  { id: 'ica', lat: -14.1, lon: -75.7 },
];
