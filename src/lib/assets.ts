/** Ruta absoluta de un archivo de /public (las rutas de media.config.ts son relativas a la raíz). */
export function asset(path: string): string {
  return /^(https?:)?\/\//.test(path) || path.startsWith('/') ? path : `/${path}`;
}
