# Medios de la web

**Todo se configura en un solo archivo: `src/app/core/config/media.config.ts`.**
Ahí están, por sección, la imagen y el video (ruta local o link directo `https://…/video.mp4`):

- `HERO` — cadena de hasta 3 videos que pasan de uno a otro con fundido.
- `ORIGEN` — foto de "Nace en el desierto que florece" (video opcional).
- `PROCESO` — imagen + video de cada etapa (se reproducen solo a la vista).
- `PRODUCTOS` — imagen de cada tarjeta + video opcional al pasar el mouse.

Recomendado para videos: 1080p (Full HD), sin audio. Un link 4K pesa 10–20 veces más y
hace lenta la carga, sobre todo en celular.

Los originales en 4K que se guarden en `public/media/videos/` **no se publican** (excluidos en
`angular.json` → assets → ignore) ni se suben a git (`.gitignore`).

## Comprimir un video local (opcional)

Para usar otro video como fondo del hero (desde la carpeta del proyecto):

```bash
# 1) MP4 liviano (2 pasadas, ~2,6 Mbps)
ffmpeg -i public/media/videos/ORIGINAL.mp4 -an -vf "fps=30,scale=-2:1080" -c:v libx264 -preset slow -b:v 2600k -pass 1 -f null NUL
ffmpeg -i public/media/videos/ORIGINAL.mp4 -an -vf "fps=30,scale=-2:1080" -c:v libx264 -preset slow -b:v 2600k -pass 2 -movflags +faststart public/media/hero-campo.mp4
# 2) WebM
ffmpeg -i public/media/hero-campo.mp4 -an -c:v libvpx-vp9 -b:v 2000k -row-mt 1 -cpu-used 5 public/media/hero-campo.webm
# 3) Póster
ffmpeg -ss 0.5 -i public/media/hero-campo.mp4 -frames:v 1 -vf scale=1600:-2 -quality 50 public/media/hero-campo-poster.webp
```
Loops de producto (opcional): agrega `video: { webm, mp4 }` al producto en `productos.data.ts`.

Comprime antes de subir:

```bash
# imagen → webp
cwebp -q 75 foto.jpg -o hero-campo.webp
# video → webm + mp4 sin audio, 1080p
ffmpeg -i video.mov -an -vf scale=-2:1080 -c:v libvpx-vp9 -crf 36 -b:v 0 hero-campo.webm
ffmpeg -i video.mov -an -vf scale=-2:1080 -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-campo.mp4
```
