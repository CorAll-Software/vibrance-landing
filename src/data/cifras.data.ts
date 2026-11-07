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
 * Certificaciones de las plantas de empaque aliadas (fila en movimiento de la sección Datos).
 * Todas se muestran igual, solo en texto: los logos de BRCGS, SENASA, FDA y Ethical Trading
 * Initiative no se pueden usar, y así ninguna resalta sobre otra.
 * Nombre y descripción de cada una: i18n `datos.certs.<id>`.
 */
export const CERTIFICATIONS: {
  id: 'brcgs' | 'haccp' | 'bpm' | 'senasa' | 'fda' | 'eti';
}[] = [
  { id: 'brcgs' },
  { id: 'haccp' },
  { id: 'bpm' },
  { id: 'senasa' },
  { id: 'fda' },
  { id: 'eti' },
];
