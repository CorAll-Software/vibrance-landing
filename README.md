# MelanieFruit — Landing exportadora (Propuesta 1)

Landing interactiva "Del campo al mundo" en Angular 22 (standalone, signals, zoneless),
Tailwind CSS v4, GSAP + ScrollTrigger, Lenis y Transloco (ES/EN en tiempo real).

## Comandos

```bash
npm install
npm start          # http://localhost:4200
npm run build      # build de producción en dist/
npm test           # pruebas unitarias (Vitest)
```

> Angular CLI 22 requiere Node.js ≥ 22.22.3 (o 24.15+).

## Dónde cambiar el contenido provisional

| Qué | Dónde |
|---|---|
| Nombre de marca, contacto, redes, nota de "datos de ejemplo" | `src/app/core/config/brand.ts` |
| Textos ES / EN | `public/i18n/es.json`, `public/i18n/en.json` |
| Productos, meses de cosecha, calibres | `src/app/data/productos.data.ts` |
| Etapas del proceso | `src/app/data/proceso.data.ts` |
| Cifras y certificaciones | `src/app/data/cifras.data.ts` |
| Destinos y zonas de cultivo (lat/lon) | `src/app/data/destinos.data.ts` |
| Imágenes y video del hero | `src/app/data/media.data.ts` + `public/media/` (ver su README) |
| Envío del formulario de cotización | `src/app/core/services/quote.service.ts` (hoy simulado) |

Todo lo provisional está marcado con `TODO: dato real de la clienta`.
Para probar el mensaje de error del formulario abre `/?simular-error`.

## Estructura

```
src/app/
├── core/        config/brand.ts, services/ (smooth-scroll, language, ui-state, quote, transloco-loader)
├── layout/      header (+ selector ES/EN), footer, loader
├── sections/    hero, origen, proceso, productos, datos, contacto (+ modal de cotización)
├── shared/      components/ modal, product-card, availability-calendar, counter, map-peru, map-world
└── data/        *.data.ts
```

## Notas de animación

- Lenis + ScrollTrigger se sincronizan en `SmoothScrollService`, fuera de Angular.
- Cada animación usa `gsap.context()` / `gsap.matchMedia()` y se revierte al destruir el componente.
- **Proceso**: pin + scroll horizontal solo con `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`;
  en móvil o con movimiento reducido es una línea de tiempo vertical.
- Con "reducir movimiento": sin loader, sin Lenis, sin scrub/parallax/marquee, contadores con el valor final.
