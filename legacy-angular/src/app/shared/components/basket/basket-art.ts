/**
 * Geometría de la cesta de mimbre Vibrance (viewBox 0 0 200 200).
 * Tejido en hileras alternadas, varillas verticales y borde trenzado.
 */
import type { ProductId } from '../../../data/productos.data';

const f = (n: number) => n.toFixed(1);
const B = { cx: 100, rim: 110, rx: 70, bottom: 192, sag: 12 };
/** Curvatura de las filas del tejido (más bajas al centro, por la perspectiva). */
const sagAt = (x: number) => B.sag * (1 - ((x - B.cx) / B.rx) ** 2);
const quadPoint = (p0: number[], c: number[], p1: number[], t: number) => [
  (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t ** 2 * p1[0],
  (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t ** 2 * p1[1],
];

export const BASKET = {
  cx: B.cx,
  rim: B.rim,
  rx: B.rx,
  body:
    `M${B.cx - B.rx} ${B.rim}Q${B.cx - B.rx + 3} 150 ${B.cx - 52} ${B.bottom - 5}` +
    `Q${B.cx} ${B.bottom + 10} ${B.cx + 52} ${B.bottom - 5}` +
    `Q${B.cx + B.rx - 3} 150 ${B.cx + B.rx} ${B.rim}` +
    `Q${B.cx} ${B.rim + B.sag * 1.8} ${B.cx - B.rx} ${B.rim}Z`,
  frontRim: `M${B.cx - B.rx} ${B.rim}Q${B.cx} ${B.rim + B.sag * 1.8} ${B.cx + B.rx} ${B.rim}`,
  backRim: `M${B.cx - B.rx} ${B.rim}Q${B.cx} ${B.rim - B.sag * 1.8} ${B.cx + B.rx} ${B.rim}`,
};

/** Fibras del tejido: hileras de "trenzas" que se alternan como el mimbre real. */
export const WEAVE: { x: number; y: number; w: number; rot: number }[] = [];
for (let row = 0; row < 10; row++) {
  const y0 = B.rim + 10 + row * 7.8;
  const offset = row % 2 ? 8 : 0;
  for (let x = B.cx - B.rx - 8 + offset; x < B.cx + B.rx + 8; x += 16) {
    const y = y0 + sagAt(x) * (1 - row / 14);
    const slope = (-2 * B.sag * (x - B.cx)) / (B.rx * B.rx);
    WEAVE.push({ x, y, w: 16.5, rot: (Math.atan(slope) * 180) / Math.PI });
  }
}

/** Varillas verticales del tejido. */
export const STAKES: string[] = [];
for (let x = B.cx - B.rx + 8; x < B.cx + B.rx - 2; x += 16) {
  const t = (x - B.cx) / B.rx;
  const xb = B.cx + t * 52;
  STAKES.push(
    `M${f(x)} ${f(B.rim + sagAt(x) * 1.8)}L${f(xb)} ${f(B.bottom - 3 + (1 - t * t) * 8)}`,
  );
}

/** Trenzado del borde. */
export const BRAID: string[] = [];
for (let i = 0; i <= 20; i++) {
  const p = quadPoint(
    [B.cx - B.rx, B.rim],
    [B.cx, B.rim + B.sag * 1.8],
    [B.cx + B.rx, B.rim],
    i / 20,
  );
  BRAID.push(`M${f(p[0] - 3)} ${f(p[1] - 4.2)}L${f(p[0] + 3)} ${f(p[1] + 4.2)}`);
}

/** Lugar de cada fruta dentro de la cesta (las de atrás primero). */
export const SLOTS: { id: ProductId; x: number; y: number }[] = [
  { id: 'kion', x: 72, y: 84 },
  { id: 'palta', x: 121, y: 84 },
  { id: 'mandarina', x: 84, y: 94 },
  { id: 'arandano', x: 109, y: 98 },
  { id: 'uva', x: 59, y: 105 },
  { id: 'mango', x: 136, y: 105 },
];

/** Tamaño de cada fruta (porcentaje del ancho de la cesta). */
export const FRUIT_SIZE = 27;
