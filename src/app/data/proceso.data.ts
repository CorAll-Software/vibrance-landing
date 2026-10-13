import { PROCESO } from '../core/config/media.config';

/**
 * Etapas del proceso de una comercializadora (la empresa no cultiva): del productor al importador.
 * Secuencia real, por eso sí usa numeración 01–05.
 * Imágenes y videos: core/config/media.config.ts. Textos en i18n `proceso.steps.<id>`.
 */
export interface ProcessStep {
  id: 'productores' | 'calidad' | 'empaque' | 'frio' | 'envio';
  image: string;
  video?: { webm?: string; mp4?: string };
}

const IDS: ProcessStep['id'][] = ['productores', 'calidad', 'empaque', 'frio', 'envio'];

/** Imagen y video de cada etapa: se editan en core/config/media.config.ts */
export const PROCESS_STEPS: ProcessStep[] = IDS.map((id) => ({ id, ...PROCESO[id] }));
