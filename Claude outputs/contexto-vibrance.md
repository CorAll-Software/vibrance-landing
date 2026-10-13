# Contexto del proyecto – Vibrance Inca Harvest (landing en Angular)

> **Para quien recibe este documento (persona o asistente):** este es el estado actual del proyecto al **13 de octubre de 2026**. Reemplaza a `contexto-branding-vibrance.md`. Donde algo de versiones anteriores no coincida con este documento, **vale este documento**.

---

## 1. Resumen rápido

- **Clienta:** Melanie.
- **Razón social:** Vibrance Inca Harvest S.A.C. **RUC:** 20615112446.
- **Marca visible:** **"Vibrance"** como marca principal e **"Inca Harvest"** como descriptor. "S.A.C." solo aparece en el footer y en documentos legales.
- **Modelo de negocio:** **comercializadora**. Compra y vende fruta peruana; **no cultiva**.
- **Mercado:** **solo exportación** (B2B: importadores y distribuidores).
- **Etapa:** empresa en crecimiento, sin clientes fijos. Hubo ventas que no se concretaron por **restricciones de exportación**.
- **Productos (6):** arándano, palta, uva, mango, mandarina y kion. El kion no es fruta: se dice "frutas y kion".
- **Tono:** premium agroexportador, ordenado y "documentado". No debe parecer frutería ni marca de jugos.
- **Propuesta de valor:** selección de productores, control de calidad, cumplimiento fitosanitario y logística confiable. Se transmite **curaduría y confiabilidad**, no agricultura.

---

## 2. Stack y forma de trabajo

### 2.1 Stack

- **Angular 22:** componentes standalone, signals, zoneless y control flow.
- **Tailwind v4:** tokens definidos en `@theme`.
- **GSAP:** ScrollTrigger y MotionPathPlugin.
- **Lenis:** scroll suave.
- **Transloco:** textos en `public/i18n/{idioma}.json`.

### 2.2 Idiomas

Son 8: **es, en, fr, it, ar, he, ja, ko**. El árabe y el hebreo se muestran de derecha a izquierda (RTL). Las traducciones distintas del español y el inglés deben pasar por revisión nativa antes de publicar.

### 2.3 Rutas clave

- **Proyecto en el equipo:** `E:\Projectos\MelanieFruit`.
- **Marca, contacto, idiomas y logo:** `src/app/core/config/brand.ts`.
- **Videos e imágenes de todas las secciones:** `src/app/core/config/media.config.ts`. Es un solo archivo; **lo administra Angel y no se debe sobrescribir**.
- **Modo de las escenas fijas:** `src/app/core/config/scroll.config.ts`.
  - `SCENE_MODE = 'momentos'` (la opción elegida).
  - `MOMENT_DURATION = 1.3` segundos por momento.
- **Colores y fuentes:** `src/styles.css`, dentro de `@theme`.

### 2.4 Comandos

- **Compilar:** `npx ng build`. El presupuesto de advertencia del bundle se subió a 700 kB.
- **Pruebas:** `npx ng test --watch=false` (2 pruebas, en verde).

---

## 3. Identidad visual aplicada

### 3.1 Paleta

| Token | Hex | Uso |
|---|---|---|
| palta | `#1E3B2F` | Texto y fondos oscuros |
| palta-deep | `#142A20` | Footer |
| hoja | `#4F7A3A` | Secundario y estados activos |
| arena | `#D8C49B` | Fondo de Origen |
| mandarina | `#F2A33A` (hover `#F5B862`) | **Acento de los CTA, según el branding**. También el botón del header. |
| arándano | `#3B3F7A` | Cifras, mapas y mercados |
| niebla | `#F7F8F5` | Fondo claro |

### 3.2 Tipografía

- **Titulares:** Bricolage Grotesque.
- **Texto:** Figtree.
- **Wordmark "Vibrance":** Outfit, servida desde `public/fonts`.

### 3.3 Logo

Es un sol con hojas y hay dos rutas en `public/brand/`:

- **D:** andenes curvos. **Es la activa.**
- **C:** andenes rectos.

Se cambia con `LOGO_ROUTE` en `brand.ts`. El favicon está hecho con la ruta D.

### 3.4 Mariposa amarilla

Es un elemento de marca que viene del loader. Se reutiliza en Origen con el componente `app-butterfly`.

---

## 4. Estructura de la landing y estado por sección

**Orden de las secciones:** Loader → Hero → Origen → Proceso → Productos → Datos → Contacto → Footer, más el botón flotante de WhatsApp.

### 4.1 Hero

- **Mensaje:** "Fruta peruana, seleccionada para el mundo".
- **Videos:** cadena de videos con fundido, configurable en `media.config.ts` (`HERO.videos`, `fade`).
- **Arranque:** el video inicia tras `VIDEO_DELAY_MS`, que Angel dejó en 100 ms.
- **Paso a Origen:** al hacer scroll, la página pasa a Origen con una transición completa (opción 3, "momentos"). La transición es lineal, sin efecto de tarjeta superpuesta.

### 4.2 Origen: "Nace en el desierto que florece"

Es una escena fija en escritorio con **4 momentos**. Cada momento se reproduce completo al cruzar un tramo del scroll.

1. Aparece el mapa del Perú y la mariposa entra desde fuera de la pantalla con la **cesta Vibrance vacía**. Esta entrada ocurre una sola vez.
2. Aparecen los **íconos de fruta en sus regiones**, de norte a sur, con Lima al final.
3. **De cada región sale su fruta y vuela en arco a la cesta:**
   - Piura → mango.
   - La Libertad → arándano y palta.
   - Junín → kion.
   - Ica → uva.
   - Lima → mandarina.
4. La mariposa se lleva la cesta y en su lugar aparece **"Dónde puede llegar"**. Es un panel con los 8 mercados y cuántos productos están habilitados en cada uno, más los botones "Solicitar cotización" y "Ver productos".

**Composición:**

- **Cabecera:** solo el título y la barra de avance de los momentos, sin línea divisora.
- **Distribución:** mapa a la izquierda y mariposa con la cesta a la derecha, con la frase de cada momento debajo de la mariposa.
- **Fondo:** mapa mundial de puntos, visible en los laterales y desvanecido hacia el centro.
- **Mariposas viajeras:** cuatro mariposas pequeñas recorren los bordes dejando una estela punteada que luego se desvanece. Representan los viajes al mundo y solo se animan con la sección a la vista.

**La historia se cuenta una sola vez:**

- Al completar el momento 4, la escena queda en su estado final y no retrocede.
- Al seguir bajando, la sección deja de quedarse fija y la página se acorta sin salto visible (`SmoothScrollService.shiftBy`).
- Al volver a subir, Origen se ve completa.
- Al recargar la página, la historia se vuelve a contar desde el principio.

**Mapa del Perú:**

- Regiones naturales en color, con relieve y sombra.
- Puertos de embarque: Paita y Callao.
- Ícono de fruta por región, con pulso y una mini tarjeta al pasar el cursor.

**Quitado de Origen:** el árbol, la fila "De dónde viene nuestra fruta", el mapa mundial interactivo y la foto. La foto quedó comentada en el HTML por si se necesita.

**En móvil o con "reducir movimiento":** todo va en una columna (mapa, cesta, frase y mercados), sin escena fija y sin mariposas viajeras.

### 4.3 Proceso

- **Pasos (escena fija horizontal, modo "momentos"):**
  1. Selección de productores.
  2. Control de calidad.
  3. Empaque.
  4. Cadena de frío.
  5. Documentación y envío.
- **Control de calidad:** el texto incluye la medición de grados **Brix**.

### 4.4 Productos

- Tarjetas de los 6 productos con calendario de disponibilidad y los mercados con protocolo vigente.
- La ficha incluye la nota: "Variedades, calibres y presentaciones se ajustan en cada cotización."

### 4.5 Datos

- **Cifras:** se calculan desde los datos, sin trayectoria inventada. Incluyen "8 mercados con protocolo fitosanitario vigente para fruta peruana".
- **Mapa mundial:** sigue en esta sección, pendiente de decidir si se queda.
- **Tabla de acceso:** producto × mercado. Lo que no tiene protocolo dice "Consultar"; **nunca se promete acceso**.
- **Certificaciones:**
  - Van solo como **texto**, en una franja en movimiento con 6 tarjetas uniformes: BRCGS, HACCP, BPM, SENASA, FDA y ETI.
  - **Sin logos ni íconos**, para no destacar unas sobre otras. Además, algunos logos no se pueden usar sin autorización.

### 4.6 Contacto y footer

- **Formulario de cotización:** pide el país de destino y promete confirmar el protocolo antes de cotizar.
- **Contacto:**
  - Correo: **ventas@vibranceincaharvest.com**.
  - Teléfono de la empresa: **+51 920 503 588**.
  - WhatsApp flotante: **+51 988 983 710**, con mensaje traducido.
- **Footer:** "© año Vibrance Inca Harvest S.A.C. · RUC 20615112446 · derechos". En RTL, el teléfono y el RUC se protegen con `bdi`.

---

## 5. Decisiones clave tomadas

- La marca es una **comercializadora**: el sitio no dice que la empresa cultiva.
- **Restricciones de exportación:** se muestra con honestidad qué mercado está habilitado para cada producto.
- **CTA:** usan el amarillo-naranja del branding `#F2A33A`; no se usa el naranja anterior.
- **Scroll:**
  - Modo "momentos" (opción 3) en Origen, en Proceso y en el paso del hero a Origen.
  - Sin imán y sin fundidos de color entre secciones.
  - Se mantiene la entrada en cascada de los textos (`data-reveal`).
- **Medios:** se usan enlaces externos (Pexels / Unsplash) en vez de archivos comprimidos en el repo, para no perder resolución.
- **Certificaciones:** solo texto, sin jerarquía visual entre ellas.

---

## 6. Pendientes

- **Validar con Melanie (y con SENASA cuando aplique):**
  - Qué fruta sale de cada región.
  - Los puertos de embarque.
  - La tabla de acceso producto × mercado.
  - Variedades y temporadas.
  - Todos estos datos son **de ejemplo** por ahora.
- **Mapa mundial de Datos:** decidir si se mantiene.
- **Traducciones:** revisión nativa de fr, it, ar, he, ja y ko.
- **Limpieza de textos:** quitar claves sin uso (`origen.legendRoute`, `origen.treeLabel`).
- **Medios:**
  - Los enlaces de Pexels en `media.config.ts` son de "descarga" y no URLs directas al `.mp4`, así que pueden fallar.
  - El póster del hero pesa 19.9 MB y conviene optimizarlo.
- **Marca:**
  - Verificar "Vibrance" en INDECOPI, USPTO y EUIPO (clase 31) y la disponibilidad del dominio.
  - Confirmar las redes sociales y el enlace de privacidad, que hoy son `#`.
- **Código de actividad en SUNAT:** la ficha dice "Cultivo de frutas", pero el sitio afirma que la empresa no cultiva. Conviene aclararlo con la clienta.
- **Notas de ejemplo:** cuando haya datos reales, poner `SHOW_PLACEHOLDER_NOTES = false` en `brand.ts`.

---

## 7. Riesgos

- Publicar con datos de ejemplo podría prometer acceso a mercados que no están habilitados.
- Los videos con enlaces no directos o los archivos pesados afectan la carga y la primera impresión.
- Las traducciones sin revisión nativa pueden restar credibilidad en mercados como Japón, Corea o Medio Oriente.
