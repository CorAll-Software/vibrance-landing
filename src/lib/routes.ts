import { DEFAULT_LANG, type Lang } from '../config/brand';

/**
 * Una URL por idioma: el idioma por defecto vive en la raíz (`/`) y el resto en su carpeta
 * (`/en/`, `/zh/`…). Cada una es un HTML estático con el texto ya traducido.
 */
export function langPath(l: Lang): string {
  return l === DEFAULT_LANG ? '/' : `/${l}/`;
}
