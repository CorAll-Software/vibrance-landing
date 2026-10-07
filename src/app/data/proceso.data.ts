/**
 * Etapas del proceso (secuencia real: aquí sí se usa numeración 01–05).
 * TODO: dato real de la clienta — imágenes provisionales; textos en i18n `proceso.steps.<id>`.
 */
export interface ProcessStep {
  id: 'siembra' | 'cosecha' | 'empaque' | 'frio' | 'envio';
  image: string;
  video?: { webm?: string; mp4?: string };
}

export const PROCESS_STEPS: ProcessStep[] = [
  { id: 'siembra', image: 'media/proceso-1-siembra.webp' },
  { id: 'cosecha', image: 'media/proceso-2-cosecha.webp' },
  { id: 'empaque', image: 'media/proceso-3-empaque.webp' },
  { id: 'frio', image: 'media/proceso-4-frio.webp' },
  { id: 'envio', image: 'media/proceso-5-envio.webp' },
];
