# Medios provisionales

Las imágenes `.webp` de esta carpeta son **ilustraciones provisionales** generadas para la propuesta.
Reemplázalas por fotos/videos reales (o material libre de Pexels / Unsplash) **con el mismo nombre**,
o cambia las rutas en `src/app/data/*.data.ts`.

| Archivo | Uso | Sugerencia de búsqueda | Tamaño recomendado |
|---|---|---|---|
| `hero-campo.webp` (+ `.webm`/`.mp4`) | Fondo del hero / poster del video | "avocado farm aerial", "peru farm drone" | 1920×1080, video ≤ 4 MB sin audio |
| `origen-campo.webp` | Foto de Origen (parallax) | "peru desert agriculture", "irrigated field desert" | 1200×1500 |
| `proceso-1-siembra.webp` … `proceso-5-envio.webp` | Etapas del Proceso | "seedlings", "fruit harvest", "packing house", "cold storage", "reefer container ship" | 1200×800 |
| `producto-*.webp` | Cards y modal de producto | "hass avocado", "blueberries", "mango", "green grapes" | 900×1100 |

Videos del hero: al tener los archivos, descomenta las rutas en `src/app/data/media.data.ts`.
Loops de producto (opcional): agrega `video: { webm, mp4 }` al producto en `productos.data.ts`.

Comprime antes de subir:

```bash
# imagen → webp
cwebp -q 75 foto.jpg -o hero-campo.webp
# video → webm + mp4 sin audio, 1080p
ffmpeg -i video.mov -an -vf scale=-2:1080 -c:v libvpx-vp9 -crf 36 -b:v 0 hero-campo.webm
ffmpeg -i video.mov -an -vf scale=-2:1080 -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-campo.mp4
```
