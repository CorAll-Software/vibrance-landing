import type { Lang } from '../config/brand';
import es from '../i18n/es.json';
import type { Dict } from './i18n';

/**
 * Diccionario de un idioma, para el build (página y cabecera de cada idioma).
 * Es la misma carga diferida que usa el navegador en i18n.ts (el español ya va en el bundle),
 * así cada idioma sigue siendo un archivo aparte que solo se descarga al elegirlo.
 */
const loaders = import.meta.glob<{ default: Dict }>(['../i18n/*.json', '!../i18n/es.json']);

export async function loadDict(l: Lang): Promise<Dict> {
  if (l === 'es') return es as Dict;
  const loader = loaders[`../i18n/${l}.json`];
  if (!loader) throw new Error(`Falta el diccionario src/i18n/${l}.json`);
  return (await loader()).default;
}
