/**
 * Genera las imágenes que se suben al bucket R2 `vibrance-prod-public`
 * (https://media-vibrance.corall.dev). Las imágenes no se sirven desde /public: este script deja
 * los archivos en branding/bucket/ con la misma estructura de carpetas que tienen en el bucket.
 *
 *   node branding/bucket/generar.mjs
 *
 * - seo/og-vibrance.jpg  → imagen para redes (Open Graph / Twitter), 1200×630 en JPG
 *                          (WhatsApp, LinkedIn y Facebook no siempre muestran WebP).
 * - brand/corall.webp    → logo de CorAll (blanco) para el "powered by" del footer.
 */
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../../', import.meta.url));
const out = (p) => fileURLToPath(new URL(p, import.meta.url));

// Imagen para redes: foto del campo + degradado de marca + logo centrado (sin texto, vale para los 9 idiomas)
const W = 1200;
const H = 630;
const LOGO_W = 520;
const logo = await sharp(`${root}public/brand/logo-mundo/completo-hoja-oscuro.svg`, {
  density: 300,
})
  .resize({ width: LOGO_W })
  .toBuffer();
const shade = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="70%">
        <stop offset="0" stop-color="#1e3b2f" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#132a20" stop-opacity="0.85"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`,
);
const logoMeta = await sharp(logo).metadata();
await mkdir(out('seo'), { recursive: true });
await sharp(`${root}public/media/campo.webp`)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .composite([
    { input: shade },
    { input: logo, left: Math.round((W - LOGO_W) / 2), top: Math.round((H - logoMeta.height) / 2) },
  ])
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(out('seo/og-vibrance.jpg'));

// Logo de CorAll: se recorta el margen transparente y se deja a 4× su alto en pantalla (18 px)
await mkdir(out('brand'), { recursive: true });
await sharp(`${root}branding/corall/corall-logo-original.webp`)
  .trim()
  .resize({ height: 72 })
  .webp({ lossless: true })
  .toFile(out('brand/corall.webp'));

console.log('Listo: branding/bucket/seo/og-vibrance.jpg y branding/bucket/brand/corall.webp');
