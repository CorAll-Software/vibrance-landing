/**
 * Cifras de la sección Datos.
 * TODO: dato real de la clienta — TODOS los valores son de ejemplo y no deben
 * presentarse como reales. Etiquetas en i18n `datos.stats.<id>`.
 */
export interface Stat {
  id: 'hectareas' | 'toneladas' | 'paises' | 'anios';
  value: number;
  prefix?: string;
  suffix?: string;
}

export const STATS: Stat[] = [
  { id: 'hectareas', value: 1200 }, // TODO: dato real de la clienta
  { id: 'toneladas', value: 18000, prefix: '+' }, // TODO: dato real de la clienta
  { id: 'paises', value: 9 }, // TODO: dato real de la clienta (coincide con destinos.data.ts)
  { id: 'anios', value: 15 }, // TODO: dato real de la clienta
];

/**
 * Certificaciones: se muestran como espacios de logo genéricos hasta que la clienta
 * confirme cuáles tiene. TODO: dato real de la clienta (agregar `name` y `logo`).
 */
export const CERTIFICATIONS: { id: string; name?: string; logo?: string }[] = [
  { id: 'cert-1' },
  { id: 'cert-2' },
  { id: 'cert-3' },
  { id: 'cert-4' },
  { id: 'cert-5' },
  { id: 'cert-6' },
];
