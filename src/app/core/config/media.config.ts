/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MEDIOS DE LA WEB — videos e imágenes de cada sección, en un solo lugar
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Cómo cambiar un video:
 *   - Pega el link directo del archivo (debe terminar en .mp4 o .webm), p. ej.
 *     'https://videos.pexels.com/video-files/123/123-hd_1920_1080_30fps.mp4'
 *     o una ruta local dentro de /public, p. ej. 'media/mi-video.mp4'.
 *   - En Pexels: botón "Descarga gratuita" ▸ flecha ▸ "Full HD 1920x1080" ▸ clic
 *     derecho sobre el video que se abre ▸ "Copiar dirección del video".
 *   - Recomendado: 1080p (Full HD). El 4K pesa 10–20 veces más y hace lenta la carga.
 *   - Para quitar un video borra la línea `video: …` (queda la imagen).
 *
 * `image` / `poster`: imagen que se ve mientras carga el video y cuando el visitante
 * tiene activado "reducir movimiento" o "ahorro de datos". Conviene que sea un cuadro
 * del mismo video para que el cambio sea imperceptible.
 */

/** Un video: basta con `mp4`. `webm` es opcional (si existe, el navegador lo prefiere). */
export interface VideoSrc {
  mp4?: string;
  webm?: string;
}

export interface HeroVideo extends VideoSrc {
  /**
   * Opcional: segundos que se muestra antes de pasar al siguiente.
   * Si no se indica, se muestra completo.
   */
  seconds?: number;
}

export interface SectionMedia {
  image: string;
  video?: VideoSrc;
}

/* ───────────────────────────── HERO ───────────────────────────── */

export const HERO = {
  /** Imagen de fondo inicial (y la que se comparte en redes, ver src/index.html). */
  poster: 'media/campo.png',
  /**
   * Cadena de videos (máximo 3). Se reproducen en orden y pasan de uno a otro con
   * un fundido; al terminar el último vuelve al primero. Con uno solo, se repite.
   */
  videos: [
    { mp4: 'https://www.pexels.com/es-es/download/video/28443572/', webm: 'https://www.pexels.com/es-es/download/video/28443572/' },
    { mp4: 'https://www.pexels.com/es-es/download/video/11760126/', seconds:  20},
    { mp4: 'https://www.pexels.com/es-es/download/video/3596844/' },
    { mp4: 'https://www.pexels.com/es-es/download/video/15909393/'},
  ] as HeroVideo[],
  /** Duración del fundido entre videos, en segundos. */
  fade: 1.2,
};

/* ──────────────────────────── ORIGEN ──────────────────────────── */
/* "Nace en el desierto que florece" */

export const ORIGEN: SectionMedia = {
  image: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  // video: { mp4: 'https://…/desierto-cultivo.mp4' },
};

/* ──────────────────────────── PROCESO ─────────────────────────── */

export const PROCESO: Record<
  'productores' | 'calidad' | 'empaque' | 'frio' | 'envio',
  SectionMedia
> = {
  productores: {
    image: 'media/uvas.png',
    video: {
      mp4: 'https://www.pexels.com/es-es/download/video/31463341/',
      webm: 'https://www.pexels.com/es-es/download/video/31463341/',
    },
  },
  calidad: {
    image: 'media/proceso-2-calidad-poster.webp',
    video: { mp4: 'https://www.pexels.com/es-es/download/video/8633312/', webm: 'https://www.pexels.com/es-es/download/video/8633312/' },
  },
  empaque: {
    image: 'media/proceso-3-empaque-poster.webp',
    video: { mp4: 'https://www.pexels.com/es-es/download/video/8633311/', webm: 'https://www.pexels.com/es-es/download/video/8633311/' },
  },
  frio: {
    image: 'media/proceso-4-frio.webp',
    video: { mp4: 'https://www.pexels.com/es-es/download/video/10576684/', webm: 'https://www.pexels.com/es-es/download/video/10576684/' },
  },
  envio: {
    image: 'media/proceso-5-envio-poster.webp',
    video: { mp4: 'https://www.pexels.com/es-es/download/video/6390323/', webm: 'https://www.pexels.com/es-es/download/video/6390323/' },
  },
};

/* ─────────────────────────── PRODUCTOS ────────────────────────── */
/* El video se reproduce al pasar el mouse sobre la tarjeta. */

export const PRODUCTOS: Record<
  'arandano' | 'palta' | 'uva' | 'mango' | 'mandarina' | 'kion',
  SectionMedia
> = {
  arandano: { image: 'media/producto-arandano.webp' },
  palta: { image: 'media/producto-palta.webp' },
  uva: {
    image: 'media/uvas.png',
    video: { mp4: 'https://www.pexels.com/es-es/download/video/31463341/', webm: 'https://www.pexels.com/es-es/download/video/31463341/' },
  },
  mango: { image: 'media/producto-mango.webp' },
  mandarina: { image: 'media/producto-mandarina.webp' },
  kion: { image: 'media/producto-kion.webp' },
};
