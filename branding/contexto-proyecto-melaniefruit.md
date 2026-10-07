# Contexto del proyecto – Landing exportadora de fruta (MelanieFruit)

Este documento resume el proyecto para trabajar el **branding y el logo** de la marca.

## 1. El negocio

- **Clienta:** Melanie. Su empresa exporta fruta fresca peruana.
- **Marca:** todavía **no tiene nombre**. En la web se usa el nombre provisional **"Aurora Fruits"**, solo como relleno. Antes de usar ese nombre hay que confirmar que no pertenezca a una empresa real.
- **Productos (de ejemplo, falta confirmarlos):** palta Hass, arándano, mango y uva de mesa.
- **Origen:** valles de la costa peruana (de ejemplo: Piura, Lambayeque, La Libertad, Ica). Es un desierto costero que se volvió huerto gracias al riego con agua de los Andes.
- **Público:** importadores y distribuidores internacionales, es decir, un público **B2B**. Por eso la web es **bilingüe, en español e inglés**.
- **Mercados de destino (de ejemplo):** Norteamérica, Europa y Asia.
- **Referencias de diseño:** Camposol (principal) y Danper. Para la interacción se tomaron como referencia İGSAŞ, CarmoWood y Farm Minerals.

## 2. Concepto de la landing (Propuesta 1)

**"Del campo al mundo".** El scroll se plantea como un viaje: la fruta nace en el campo peruano, pasa por el proceso y llega al mundo. El estilo es llamativo e interactivo, pero con disciplina: la audacia se concentra en un solo momento, la sección **Proceso**, que tiene scroll horizontal fijo. La Propuesta 2 será más sobria y corporativa.

**Secciones:** Loader → Hero → Origen → Proceso (Siembra, Cosecha, Empaque, Cadena de frío, Envío) → Qué ofrecemos (cards de producto) → Datos (cifras, mapa mundial, certificaciones) → Cierre con eslogan y formulario de cotización.

**Textos provisionales clave:**

| Uso | Español | Inglés |
|---|---|---|
| Titular del hero | Fruta peruana, del campo al mundo | Peruvian fruit, from farm to world |
| Encabezado de Origen | Nace en el desierto que florece | Born in a blooming desert |
| Eslogan de cierre | Lo mejor del Perú, en cada caja. | The best of Peru, in every box. |

## 3. Paleta actual (provisional)

La paleta se inspira en el mundo real de la clienta: la costa desértica peruana y sus frutas.

| Token | Hex | Uso |
|---|---|---|
| palta | `#1E3B2F` | Color principal: texto y fondos oscuros (hero, Proceso, footer) |
| palta-deep | `#142A20` | Fondo del footer |
| hoja | `#4F7A3A` | Secundario: el símbolo, las líneas de progreso y los estados activos |
| arena | `#D8C49B` | Fondo de Origen (desierto costero) |
| mango | `#F2A33A` | **Acento único, solo para los CTA** (botones). No se usa como decoración |
| arándano | `#3B3F7A` | Acento secundario: cifras y mapa de la sección Datos |
| niebla | `#F7F8F5` | Fondo claro general |

## 4. Tipografía actual

- **Display:** *Bricolage Grotesque*, en Bold. Se usa en los titulares, las cifras y el wordmark del logo provisional.
- **Texto:** *Figtree*, para párrafos e interfaz.
- Las dos fuentes son gratuitas y están en Google Fonts.
- Hay tratamientos que se decidieron **evitar**: etiquetas en mayúsculas con mucho espaciado, resaltar una sola palabra en otro color y poner flechas "→" en todos los botones.

## 5. Logo provisional que se usó

Es un logo **de relleno**, hecho solo para la maqueta y no pensado como identidad final.

- **Símbolo:** una hoja verde (`#4F7A3A`) con su nervadura, dentro de un círculo con un tinte suave (palta al 12 %).
- **Wordmark:** "Aurora Fruits" en Bricolage Grotesque Bold, con interletrado ligeramente cerrado.
- **Versiones:** una en color palta sobre fondo claro y otra en blanco niebla sobre fondo palta (en el header, cuando está sobre el hero).
- **Loader:** el contorno de una palta que se dibuja, con la semilla en color arena.
- **Archivos:** `logo-simbolo.svg`, `logo-horizontal.svg`, `loader-palta.svg` y `logo-provisional-preview.png`.

**Debilidades a resolver en el branding real:**

- La hoja es genérica y no comunica ni Perú ni fruta concreta.
- El símbolo se ve débil en tamaños pequeños, como el favicon.
- El nombre no es definitivo.

## 6. Qué necesita el branding

1. **Nombre** de la marca, que funcione en español y en inglés para un público B2B internacional.
2. **Logo:** símbolo y wordmark, en versión clara y oscura, legible desde unos 24 px (favicon y header de 72 px de alto).
3. **Paleta final:** puede partir de la actual. El acento de los CTA debe tener buen contraste sobre verde oscuro y sobre fondo claro (WCAG AA).
4. **Tipografías finales**, de preferencia de Google Fonts o con licencia web.
5. **Eslogan** en español e inglés.
6. **Imagen y tono:** cercano al campo y confiable para importadores. Debe sentirse **premium agroexportador** y no "frutería".

## 7. Cómo se integra en la web (Angular)

- El nombre de la marca se cambia en un solo lugar: `src/app/core/config/brand.ts` (`BRAND_NAME`).
- Los colores son tokens de Tailwind en `src/styles.css`, dentro de `@theme` (`--color-palta`, etc.).
- El logo está como SVG en línea en `src/app/layout/header/header.html`, y el loader en `src/app/layout/loader/loader.ts`.
- Los textos están en `public/i18n/es.json` y `en.json`.
- **Entregables ideales:** SVG optimizados (símbolo, horizontal y monocromo), favicon `.ico` o `.png`, e imagen Open Graph de 1200×630.
