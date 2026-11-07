/**
 * Dominios de la web.
 *
 * - SITE_URL: dominio público de la landing. Con él se arman la URL canónica, los `hreflang`,
 *   el sitemap, robots.txt y las etiquetas de redes. Sale de `site` en astro.config.mjs, que se
 *   cambia en el build con la variable SITE_URL (p. ej. para un entorno de pruebas).
 * - MEDIA_URL: bucket público de Cloudflare R2 `vibrance-prod-public`, donde viven los videos y
 *   las imágenes nuevas (no van en /public ni en git). Ver branding/bucket/.
 */
export const SITE_URL = (import.meta.env.SITE ?? 'https://vibrance.corall.dev').replace(/\/$/, '');

export const MEDIA_URL = 'https://media-vibrance.corall.dev';

/** Imagen para redes (Open Graph / Twitter): 1200×630 en JPG, en el bucket. */
export const OG_IMAGE = {
  url: `${MEDIA_URL}/seo/og-vibrance.jpg`,
  width: 1200,
  height: 630,
  type: 'image/jpeg',
} as const;
