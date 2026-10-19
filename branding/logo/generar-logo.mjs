/**
 * Genera el logo "sol + mundo + mariposa" (feedback del 18-oct-2026) y sus variantes.
 *   node branding/logo/generar-logo.mjs
 *
 * - El sol y las 5 hojas son los del logo D (misma geometría y colores).
 * - La base es la curva de un mundo con un meridiano y un paralelo. Las líneas y el
 *   filo entre el sol y el mundo son recortes (máscara), así se ve el fondo detrás.
 * - La mariposa vuela hacia arriba a la derecha con una estela de puntos.
 *
 * Salida en public/brand/logo-mundo/:
 *   completo-{tono}-{fondo}.svg  con estela (header, footer, tarjetas, presentaciones)
 *   simple-{tono}-{fondo}.svg    sin estela (pestaña del navegador, ícono de WhatsApp)
 * {fondo} = claro (para fondos claros) | oscuro (para fondos oscuros), como en logo-D-*.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../public/brand/logo-mundo');

/** Los tres verdes de prueba que pidió la clienta para el mundo. */
const TONOS = {
  hoja: '#4F7A3A',
  vivo: '#6BAA3A',
  lima: '#8CC152',
};

const FONDOS = {
  claro: { hojas: '#4F7A3A', cuerpo: '#1E3B2F' },
  oscuro: { hojas: '#9CC27A', cuerpo: '#F7F8F5' },
};

const SOL = '#F2A33A';
const ALA_ARRIBA = '#F2A33A';
const ALA_ABAJO = '#E5862B';

// Centro y radio del sol (los del logo D)
const CX = 192;
const CY = 198;
const R_SOL = 90.5;

// Mundo: casquete de un círculo grande cortado abajo
const MUNDO_TOP = 184;
const R_MUNDO = 190;
const MUNDO_CY = MUNDO_TOP + R_MUNDO;
const BASE = 266;
const MEDIA_CUERDA = Math.sqrt(R_MUNDO ** 2 - (MUNDO_CY - BASE) ** 2);
const f = (n) => +n.toFixed(1);

const mundoPath =
  `M${f(CX - MEDIA_CUERDA)} ${BASE}` +
  `A${R_MUNDO} ${R_MUNDO} 0 0 1 ${f(CX + MEDIA_CUERDA)} ${BASE}Z`;

/** Hoja almendrada vertical de 76 de largo, centrada en el origen. */
const HOJA = 'M0 -38C22 -20 22 20 0 38C-22 20 -22 -20 0 -38Z';
const hojas = [90, 126, 54, 162, 18]
  .map((deg) => {
    const a = (deg * Math.PI) / 180;
    const x = f(CX + 152 * Math.cos(a));
    const y = f(CY - 152 * Math.sin(a));
    return `<path d="${HOJA}" transform="translate(${x} ${y}) rotate(${90 - deg})"/>`;
  })
  .join('');

/** Mariposa vista desde arriba, cuerpo vertical en el origen (se rota al colocarla). */
const mariposa = (cuerpo) =>
  `<ellipse cx="-15" cy="-9" rx="14" ry="19" transform="rotate(-28 -15 -9)" fill="${ALA_ARRIBA}"/>` +
  `<ellipse cx="15" cy="-9" rx="14" ry="19" transform="rotate(28 15 -9)" fill="${ALA_ARRIBA}"/>` +
  `<ellipse cx="-10" cy="13" rx="9" ry="11" transform="rotate(30 -10 13)" fill="${ALA_ABAJO}"/>` +
  `<ellipse cx="10" cy="13" rx="9" ry="11" transform="rotate(-30 10 13)" fill="${ALA_ABAJO}"/>` +
  `<rect x="-3.4" y="-20" width="6.8" height="40" rx="3.4" fill="${cuerpo}"/>` +
  `<path d="M-1.5 -19C-4 -27 -7 -31 -11 -33M1.5 -19C4 -27 7 -31 11 -33" fill="none" stroke="${cuerpo}" stroke-width="2.6" stroke-linecap="round"/>` +
  `<circle cx="-11.5" cy="-33.5" r="3" fill="${cuerpo}"/><circle cx="11.5" cy="-33.5" r="3" fill="${cuerpo}"/>`;

const MARIPOSA_EN = 'translate(350 50) rotate(32) scale(1.18)';
/** Estela: sale del borde del sol y sube en curva hasta la mariposa. */
const ESTELA = 'M268 150C310 141 333 120 338 88';

function svg({ tono, fondo, estela }) {
  const { hojas: colorHojas, cuerpo } = FONDOS[fondo];
  const titulo = `Vibrance — logo ${estela ? 'completo' : 'simple'} (${fondo})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 270" width="400" height="270" role="img" aria-label="${titulo}">
  <defs>
    <mask id="m-sol" maskUnits="userSpaceOnUse">
      <rect width="400" height="270" fill="#fff"/>
      <circle cx="${CX}" cy="${MUNDO_CY}" r="${R_MUNDO + 6}" fill="#000"/>
    </mask>
    <mask id="m-mundo" maskUnits="userSpaceOnUse">
      <rect width="400" height="270" fill="#fff"/>
      <g fill="none" stroke="#000" stroke-width="5.5" stroke-linecap="round">
        <path d="M122 ${BASE + 4}C126 216 154 ${MUNDO_TOP + 1} ${CX} ${MUNDO_TOP + 1}C230 ${MUNDO_TOP + 1} 258 216 262 ${BASE + 4}"/>
        <path d="M20 228Q${CX} 212 364 228"/>
      </g>
    </mask>
  </defs>
  <g fill="${colorHojas}">${hojas}</g>
  <path d="M${f(CX - R_SOL)} ${CY}A${R_SOL} ${R_SOL} 0 0 1 ${f(CX + R_SOL)} ${CY}Z" fill="${SOL}" mask="url(#m-sol)"/>
  <path d="${mundoPath}" fill="${TONOS[tono]}" mask="url(#m-mundo)"/>${
    estela
      ? `
  <path d="${ESTELA}" fill="none" stroke="${SOL}" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0 10.5"/>`
      : ''
  }
  <g transform="${MARIPOSA_EN}">${mariposa(cuerpo)}</g>
</svg>
`;
}

mkdirSync(OUT, { recursive: true });
for (const tono of Object.keys(TONOS)) {
  for (const fondo of Object.keys(FONDOS)) {
    for (const estela of [true, false]) {
      const name = `${estela ? 'completo' : 'simple'}-${tono}-${fondo}.svg`;
      writeFileSync(join(OUT, name), svg({ tono, fondo, estela }));
    }
  }
}
console.log('Logos generados en', OUT);
