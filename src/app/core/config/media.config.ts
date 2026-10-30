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
 *
 * Videos propios: viven en el bucket público de Cloudflare R2 `vibrance-prod-public` (no en
 * /public ni en git). Se suben con la misma estructura de carpetas: hero/…, proceso/….
 */

/** URL pública del bucket R2 con los videos propios. */
const VIDEOS = 'https://pub-8fe73c852b544716958f89ae45287ac2.r2.dev';

/** Un video: basta con `mp4`. `webm` es opcional (si existe, el navegador lo prefiere). */
export interface VideoSrc {
  mp4?: string;
  webm?: string;
  /** Opcional: versión liviana (MP4) que se usa en celulares en lugar de `mp4`. */
  mobile?: string;
}

export interface HeroVideo extends VideoSrc {
  /**
   * Video propio en 4 calidades: ruta base sin terminación, p. ej. 'media/hero/hero-1'
   * usa hero-1-720.mp4, -1080, -1440 y -2160. Cada visitante recibe la
   * calidad que su pantalla puede mostrar (ver public/media/README.md para generarlas).
   * Si se indica, reemplaza a `mp4` / `webm`.
   */
  local?: string;
  /**
   * Opcional: segundos que se muestra antes de pasar al siguiente.
   * Si no se indica, se muestra completo.
   */
  seconds?: number;
}

export interface SectionMedia {
  image: string;
  /** true: se muestra el recuadro "Foto aquí" hasta tener la foto real (la clienta la entrega). */
  placeholder?: boolean;
  video?: VideoSrc;
}

/* ───────────────────────────── HERO ───────────────────────────── */

export const HERO = {
  /**
   * Imagen de fondo inicial: es el primer cuadro del primer video, así al arrancar la imagen
   * "cobra vida" sin que se note el cambio. Si cambias el primer video, saca su primer cuadro
   * (ver public/media/README.md). La imagen para redes está aparte, en src/index.html.
   */
  poster: 'media/hero/hero-1-poster.webp',
  /**
   * Cadena de videos (máximo 4). Se reproducen en orden y pasan de uno a otro con
   * un fundido; al terminar el último vuelve al primero. Con uno solo, se repite.
   * Originales de Pexels: 12384756, 11760126, 3596844 y 15909393.
   */
  videos: [
    { local: `${VIDEOS}/hero/hero-1` },
    { local: `${VIDEOS}/hero/hero-2`, seconds: 20 },
    { local: `${VIDEOS}/hero/hero-3` },
    { local: `${VIDEOS}/hero/hero-4` },
  ] as HeroVideo[],
  /** Duración del fundido entre videos, en segundos. */
  fade: 1.2,
};

/* ──────────────────────────── ORIGEN ──────────────────────────── */
/* "Nace en el desierto que florece" */

export interface OrigenMedia extends SectionMedia {
  /**
   * Cara trasera de la tarjeta: se muestra cuando la tarjeta se voltea al pasar al segundo
   * párrafo. Puede ser imagen, video o ambos (la imagen se ve mientras carga el video).
   */
  back: SectionMedia;
}

export const ORIGEN: OrigenMedia = {
  image: 'media/origen/campos-andinos.webp',
  // video: { mp4: 'https://…/desierto-cultivo.mp4' },
  back: {
    // TODO: cambiar por la imagen o el video que se mostrará al voltear la tarjeta
    image:
      'https://plus.unsplash.com/premium_photo-1682126515886-7ae6955bb38d?q=80&w=734&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    // video: { mp4: 'https://…/seleccion-productores.mp4' },
  },
};

/* ──────────────────────────── PROCESO ─────────────────────────── */

export const PROCESO: Record<
  'productores' | 'calidad' | 'empaque' | 'frio' | 'envio',
  SectionMedia
> = {
  // Videos propios en 4:3 (1080×810, 30 fps; en celular, `mobile` de 720×540): la medida de
  // la tarjeta. La imagen es el primer cuadro de cada video, así al empezar a moverse no se
  // nota el cambio.
  // Originales de Pexels: 31463341, 8633312, 8633311, 10576684 y 6390323.
  productores: {
    image: 'media/proceso/productores-poster.webp',
    video: {
      mp4: `${VIDEOS}/proceso/productores.mp4`,
      mobile: `${VIDEOS}/proceso/productores-m.mp4`,
    },
  },
  calidad: {
    image: 'media/proceso/calidad-poster.webp',
    video: { mp4: `${VIDEOS}/proceso/calidad.mp4`, mobile: `${VIDEOS}/proceso/calidad-m.mp4` },
  },
  empaque: {
    image: 'media/proceso/empaque-poster.webp',
    video: { mp4: `${VIDEOS}/proceso/empaque.mp4`, mobile: `${VIDEOS}/proceso/empaque-m.mp4` },
  },
  frio: {
    image: 'media/proceso/frio-poster.webp',
    video: { mp4: `${VIDEOS}/proceso/frio.mp4`, mobile: `${VIDEOS}/proceso/frio-m.mp4` },
  },
  envio: {
    image: 'media/proceso/envio-poster.webp',
    video: { mp4: `${VIDEOS}/proceso/envio.mp4`, mobile: `${VIDEOS}/proceso/envio-m.mp4` },
  },
};

/* ─────────────────────────── PRODUCTOS ────────────────────────── */
/* Foto de cada panel del catálogo y del detalle del producto. */

export const PRODUCTOS: Record<
  'arandano' | 'palta' | 'uva' | 'mango' | 'mandarina' | 'kion',
  SectionMedia
> = {
  arandano: { image: 'media/producto-arandano.webp' },
  palta: { image: 'media/producto-palta.webp' },
  uva: { image: 'media/producto-uva.webp' },
  mango: { image: 'media/producto-mango.webp' },
  mandarina: { image: 'media/producto-mandarina.webp' },
  kion: { image: 'media/producto-kion.webp' },
};
