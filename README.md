<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/logo-mundo/completo-hoja-oscuro.svg" />
  <img src="public/brand/logo-mundo/completo-hoja-claro.svg" alt="Logo Vibrance Inca Harvest" width="220" />
</picture>

# Vibrance · Inca Harvest

**Fruta peruana, seleccionada para el mundo.**

Landing de **Vibrance Inca Harvest S.A.C.** (Lima, Perú): comercializadora de fruta fresca que elige a los productores, controla la calidad y gestiona la exportación para importadores y distribuidores de todo el mundo.

![Astro](https://img.shields.io/badge/Astro-7-1e3b2f?logo=astro&logoColor=f2a33a)
![TypeScript](https://img.shields.io/badge/TypeScript-6-1e3b2f?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-1e3b2f?logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-4f7a3a?logo=greensock&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-9%20idiomas-f2a33a?labelColor=1e3b2f)

</div>

---

## Contenido

- [Sobre Vibrance](#sobre-vibrance)
- [Qué incluye la web](#qué-incluye-la-web)
- [Stack](#stack)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Cómo correrlo en local](#cómo-correrlo-en-local)
- [Scripts](#scripts)
- [Dónde cambiar el contenido](#dónde-cambiar-el-contenido)
- [Renderizado y SEO](#renderizado-y-seo)
- [Flujo de trabajo](#flujo-de-trabajo)
- [Estado del proyecto](#estado-del-proyecto)

## Sobre Vibrance

Vibrance **no cultiva: elige**. Trabaja con productores de la costa y la selva central del Perú que cumplen sus estándares, para que el importador tenga **un solo interlocutor** para varias frutas y regiones.

| Región | Cultivos |
|---|---|
| Piura | Mango y uva |
| La Libertad | Arándano y palta |
| Lima | Mandarina y palta |
| Junín | Kion y mandarina |
| Ica | Uva, palta y mandarina |

**Identidad de marca**

El logo cuenta la historia de Vibrance en un solo vistazo: el sol que sale sobre el mundo, con una mariposa volando.

| | Color | Uso |
|---|---|---|
| ![#1e3b2f](https://img.shields.io/badge/-%20%20%20%20%20-1e3b2f?style=flat-square) | `#1e3b2f` palta | Texto y fondos oscuros |
| ![#4f7a3a](https://img.shields.io/badge/-%20%20%20%20%20-4f7a3a?style=flat-square) | `#4f7a3a` hoja | Verde de marca (hojas y mundo del logo) |
| ![#f2a33a](https://img.shields.io/badge/-%20%20%20%20%20-f2a33a?style=flat-square) | `#f2a33a` mandarina | Sol, mariposa y acciones principales |
| ![#d8c49b](https://img.shields.io/badge/-%20%20%20%20%20-d8c49b?style=flat-square) | `#d8c49b` arena | Fondo de la sección Origen |
| ![#3b3f7a](https://img.shields.io/badge/-%20%20%20%20%20-3b3f7a?style=flat-square) | `#3b3f7a` arándano | Acentos |
| ![#f7f8f5](https://img.shields.io/badge/-%20%20%20%20%20-f7f8f5?style=flat-square) | `#f7f8f5` niebla | Fondos claros |

> Los colores salen de `src/styles/global.css` y el logo de `public/brand/logo-mundo/`. La marca, el descriptor y la razón social se cambian en `src/config/brand.ts`.

## Qué incluye la web

- **Intro animada** de la semilla y la mariposa, y escena de scroll con GSAP y Lenis.
- **Origen:** historia con tarjeta que se voltea, mapa del Perú con regiones de cultivo y la canasta que lleva la mariposa.
- **Nosotros**, **Proceso** del productor al almacén, **Productos** con detalle y calendario de disponibilidad.
- **Datos y cifras**, y **Cómo trabajamos** con Incoterms interactivos (FOB, CFR y CIF).
- **Formulario de cotización** con campos opcionales y aceptación de la política de privacidad.
- **9 idiomas en tiempo real:** `es`, `en`, `zh`, `fr`, `it`, `ar`, `he`, `ja`, `ko`. Árabe y hebreo se muestran de derecha a izquierda.
- **Versión móvil**, accesibilidad (foco, modales nativos, `prefers-reduced-motion`) y botón de WhatsApp.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Astro 7 (SSG) con Preact para las partes interactivas |
| Estilos | Tailwind CSS 4 |
| Animación | GSAP + ScrollTrigger, Lenis (scroll suave) |
| Idiomas | Diccionarios JSON propios (textos en `src/i18n/`) |
| Tipografías | Outfit (wordmark), Figtree y Bricolage Grotesque |

## Estructura del repositorio

```text
vibrance-landing/
├── src/
│   ├── pages/                 Una página por idioma (index.astro y [lang]/) y robots.txt
│   ├── layouts/               Layout base (head: SEO, Open Graph, hreflang, JSON-LD, favicon)
│   ├── components/
│   │   ├── layout/            Header, loader, footer, selector de idioma e indicador de scroll
│   │   ├── sections/          Hero, origen, nosotros, proceso, productos, datos, cómo trabajamos, contacto y cotización
│   │   └── shared/            Mapas, canasta, mariposa, modales y contadores
│   ├── config/                Marca, contacto, idiomas, medios y scroll
│   ├── data/                  Productos, proceso, cifras, destinos y mercados
│   ├── i18n/                  Textos de los 9 idiomas
│   ├── lib/                   Idioma, scroll suave, estado de UI y envío del formulario
│   └── styles/global.css      Colores, tipografías y estilos globales
├── public/
│   ├── brand/                 Logo, favicon e íconos
│   ├── media/                 Imágenes y video
│   └── fonts/                 Tipografías propias
└── branding/                  Materiales de marca, contexto del proyecto y archivos para el bucket (branding/bucket/)
```

## Cómo correrlo en local

### Requisitos

- [Node.js](https://nodejs.org) 22.12 o superior (o 24+) y npm. Astro lo exige.

### Pasos

```bash
npm install
npm start          # http://localhost:4321
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4321` |
| `npm run build` | Build de producción (HTML estático) en `dist/` |
| `npm run preview` | Sirve el build de `dist/` en local |
| `npm run check` | Revisa los tipos de TypeScript y Astro |

## Dónde cambiar el contenido

| Qué | Dónde |
|---|---|
| Marca, descriptor, razón social, RUC, contacto y redes | `src/config/brand.ts` |
| Textos de los 9 idiomas | `src/i18n/{es,en,zh,fr,it,ar,he,ja,ko}.json` |
| Idiomas disponibles y sus nombres | `brand.ts` (`AVAILABLE_LANGS`, `LANG_META`) |
| Productos, meses de cosecha y calibres | `src/data/productos.data.ts` |
| Etapas del proceso | `src/data/proceso.data.ts` |
| Cifras y certificaciones | `src/data/cifras.data.ts` |
| Destinos y zonas de cultivo | `src/data/destinos.data.ts` y `mercados.data.ts` |
| Imágenes y video | `src/config/media.config.ts` y `public/media/` |
| Dominio, bucket de medios e imagen para redes | `src/config/site.ts` y `astro.config.mjs` |
| "Powered by" del footer (CorAll) | `brand.ts` (`POWERED_BY`) |
| Envío del formulario de cotización | `src/lib/quote.ts` |

Lo provisional está marcado con `TODO: dato real de la clienta`.

## Renderizado y SEO

**Estrategia: SSG (generación estática).** `astro build` genera un HTML por idioma con todo el contenido ya escrito; nginx lo sirve tal cual y Preact solo se "hidrata" encima para las animaciones y la parte interactiva.

| Opción | Por qué no / por qué sí |
|---|---|
| CSR (lo que había con Angular) | Buscadores y previews de redes recibían un HTML casi vacío. |
| SSR | Exige un servidor Node para una landing cuyo contenido no cambia por visita. |
| **SSG** | HTML completo sin depender de JavaScript, sin servidor y cacheable en CDN. |

- **Una URL por idioma:** `/` (español, idioma por defecto y `x-default`), `/en/`, `/zh/`, `/fr/`, `/it/`, `/ar/`, `/he/`, `/ja/`, `/ko/`. Cada una tiene su `<title>`, `description`, `lang`/`dir` (árabe y hebreo en RTL), canónica y `hreflang` hacia las demás.
- **El selector de idioma sigue cambiando en vivo**, y además actualiza la URL y la cabecera. En la raíz se respeta el idioma guardado o el del navegador; los buscadores siempre ven el idioma de la URL que piden.
- **Redes:** Open Graph y Twitter Card con imagen de 1200×630 en el bucket.
- **Datos estructurados (JSON-LD):** `Organization` (razón social, RUC, correo, Lima), `WebSite` y `WebPage`. Sin teléfono, como pidió la clienta.
- **`sitemap-index.xml`** (con `hreflang` de cada idioma) y **`robots.txt`** se generan en el build.
- **Dominio:** sale de `site` en `astro.config.mjs` (hoy `https://vibrance.corall.dev`, porque la clienta aún no compra dominio). Cuando lo tenga, se cambia ahí o se compila con la variable `SITE_URL` (en Docker, `--build-arg SITE_URL=…`).

### Imágenes en el bucket

Las imágenes nuevas no van en `public/`: se suben al bucket R2 `vibrance-prod-public` (`https://media-vibrance.corall.dev`). `node branding/bucket/generar.mjs` las genera en `branding/bucket/` con la misma estructura de carpetas del bucket:

| Archivo | Uso |
|---|---|
| `seo/og-vibrance.jpg` | Imagen para redes (Open Graph / Twitter) |
| `brand/corall.webp` | Logo de CorAll del "powered by" del footer |

## Flujo de trabajo

- Las ramas siguen el formato `<tipo>/<descripción-corta>`, por ejemplo `feat/proceso` o `fix/optimizacion`.
- Los commits usan [Conventional Commits](https://www.conventionalcommits.org/es/) en español: `tipo: descripción`.
- Cada rama se integra a `main` mediante un pull request que cierra su issue (`Closes #n`).

## Estado del proyecto

En **fase final**: los últimos ajustes de la clienta están en revisión (correos para compradores y productores aliados, política de privacidad y envío real del formulario) y la publicación depende de adquirir el dominio y del despliegue en Cloudflare.

---

<div align="center">

Hecho con 💚 para **Vibrance Inca Harvest S.A.C.** · Lima, Perú

Uso privado. © Vibrance Inca Harvest S.A.C. Todos los derechos reservados.

</div>
