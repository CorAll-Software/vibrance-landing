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

/** Destinos de exportación (mapa mundial). */
export const DESTINATIONS: GeoPoint[] = [
  { id: 'usa', lat: 39.5, lon: -98 },
  { id: 'canada', lat: 56, lon: -106 },
  { id: 'mexico', lat: 23.6, lon: -102.5 },
  { id: 'paises_bajos', lat: 52.2, lon: 5.3 },
  { id: 'espana', lat: 40.4, lon: -3.7 },
  { id: 'reino_unido', lat: 54, lon: -2 },
  { id: 'china', lat: 35, lon: 104 },
  { id: 'corea', lat: 36.5, lon: 127.8 },
  { id: 'japon', lat: 36.2, lon: 138.2 },
];

/** Punto de salida (Perú) para las rutas del mapa mundial. */
export const ORIGIN: GeoPoint = { id: 'peru', lat: -9.2, lon: -75 };

/** Zonas de cultivo (mapa del Perú). */
export const GROWING_ZONES: GeoPoint[] = [
  { id: 'piura', lat: -5.0, lon: -80.6 },
  { id: 'lambayeque', lat: -6.0, lon: -79.8 },
  { id: 'la_libertad', lat: -8.2, lon: -78.9 },
  { id: 'ica', lat: -14.1, lon: -75.7 },
];
