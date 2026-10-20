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

## Videos del hero en 4 calidades

El hero usa videos propios en `public/media/hero/` (`hero-N-720.mp4`, `-1080`, `-1440`,
`-2160`) y cada visitante recibe la calidad que su pantalla puede mostrar (celular 720p,
laptop Full HD 1080p, monitores grandes 1440p/4K). En `media.config.ts` se indican con
`{ local: 'media/hero/hero-N' }`. Para generarlas desde un original 4K:

```bash
# repetir con 720 / crf 23 / 3M, 1080 / crf 22 / 5M, 1440 / crf 21 / 9M y 2160 / crf 20 / 16M
# si el original no es 16:9 (p. ej. 4096x2160), recórtalo: agrega crop=3840:2160 antes de scale
ffmpeg -i public/media/videos/ORIGINAL.mp4 -an -vf "fps=fps='min(source_fps,30)',scale=-2:1440:flags=lanczos" -c:v libx264 -preset slow -crf 21 -maxrate 9M -bufsize 9M -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart public/media/hero/hero-N-1440.mp4
```

Máximo 30 fps: a 60 fps el video pesa el doble y en laptops se traba sin verse mejor.
Si el original empieza con un cuadro negro, agrega `-ss 0.05` antes de `-i` para saltarlo.

La imagen de fondo del hero (`HERO.poster`) es el **primer cuadro del primer video**, para
que al arrancar la imagen simplemente empiece a moverse. Si cambias el primer video:

```bash
ffmpeg -i public/media/hero/hero-1-2160.mp4 -frames:v 1 -vf scale=1600:-2 -c:v libwebp -quality 50 public/media/hero/hero-1-poster.webp
```

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
