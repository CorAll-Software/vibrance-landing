import { GROWING_ZONES } from './destinos.data';
import { MARKETS_WITH_ACCESS } from './mercados.data';
import { MONTHS_WITH_SUPPLY, PRODUCTS } from './productos.data';

/**
 * Cifras de la sección Datos.
 * La empresa es nueva (sin historial de ventas), así que NO se muestran cifras de trayectoria
 * (hectáreas, toneladas, años). Solo datos de la oferta actual, calculados desde los otros
 * archivos de data para que siempre coincidan. Etiquetas en i18n `datos.stats.<id>`.
 */
export interface Stat {
  id: 'productos' | 'meses' | 'regiones' | 'mercados';
  value: number;
  prefix?: string;
  suffix?: string;
}

export const STATS: Stat[] = [
  { id: 'productos', value: PRODUCTS.length },
  { id: 'meses', value: MONTHS_WITH_SUPPLY },
  { id: 'regiones', value: GROWING_ZONES.length },
  { id: 'mercados', value: MARKETS_WITH_ACCESS.length },
];

/**
 * Certificaciones: se muestran como espacios de logo genéricos hasta que la clienta
 * confirme cuáles tienen sus productores / ella. TODO: dato real de la clienta (agregar `name` y `logo`).
 */
export const CERTIFICATIONS: { id: string; name?: string; logo?: string }[] = [
  { id: 'cert-1' },
  { id: 'cert-2' },
  { id: 'cert-3' },
  { id: 'cert-4' },
  { id: 'cert-5' },
  { id: 'cert-6' },
];
