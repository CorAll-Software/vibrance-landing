/**
 * Geometría del mapa del Perú (misma proyección equirectangular que PERU_PATH).
 * Las regiones naturales (costa, sierra, selva) son una aproximación estilizada: se dibujan
 * como franjas grandes y se recortan con el contorno del país.
 */

// Proyección usada para generar PERU_PATH (ver peru-path.ts)
const LEFT = -81.6;
const TOP = 0.2;
const K = 30;

/** Área visible: se amplía hacia el oeste para que quepan las etiquetas de los puertos. */
export const VB_X = -56;
export const VB_Y = 0;
export const VB_W = 452;
export const VB_H = 564;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LEFT) * K, (TOP - lat) * K];
}

/** Posición en % del área visible (para colocar elementos HTML encima del SVG). */
export function toPercent(lon: number, lat: number): { x: number; y: number } {
  const [x, y] = project(lon, lat);
  return { x: ((x - VB_X) / VB_W) * 100, y: ((y - VB_Y) / VB_H) * 100 };
}

const poly = (pts: [number, number][]) =>
  'M' +
  pts
    .map(([lon, lat]) =>
      project(lon, lat)
        .map((n) => n.toFixed(1))
        .join(','),
    )
    .join('L') +
  'Z';

/** Límite aproximado costa / sierra (pie de los Andes occidentales), de norte a sur. */
const COAST_EDGE: [number, number][] = [
  [-80.0, -3.3],
  [-80.0, -4.3],
  [-79.7, -5.2],
  [-79.6, -6.2],
  [-79.2, -7.0],
  [-78.7, -8.0],
  [-78.1, -9.0],
  [-77.6, -10.0],
  [-77.0, -11.0],
  [-76.5, -12.0],
  [-76.0, -13.0],
  [-75.6, -14.0],
  [-75.0, -15.0],
  [-73.8, -16.0],
  [-72.2, -16.8],
  [-71.0, -17.6],
  [-70.4, -18.4],
];

/** Límite aproximado sierra / selva (vertiente oriental de los Andes), de norte a sur. */
const JUNGLE_EDGE: [number, number][] = [
  [-79.0, -4.0],
  [-78.9, -5.2],
  [-78.2, -6.0],
  [-77.4, -7.0],
  [-76.9, -8.0],
  [-76.3, -9.0],
  [-75.9, -10.0],
  [-75.5, -10.8],
  [-74.9, -11.6],
  [-74.2, -12.4],
  [-73.4, -13.0],
  [-72.3, -13.4],
  [-71.3, -13.7],
  [-70.2, -14.2],
  [-69.2, -14.6],
  [-68.5, -14.8],
];

export const COAST_AREA = poly([[-84, -3.3], ...COAST_EDGE, [-70.4, -19.5], [-84, -19.5]]);
export const JUNGLE_AREA = poly([[-79.0, 1.5], ...JUNGLE_EDGE, [-67.5, -14.8], [-67.5, 1.5]]);

/** Curva suave (Catmull-Rom → Bézier) que pasa por los puntos dados, en coordenadas del SVG. */
export function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1.map((n) => n.toFixed(1)).join(',')} ${c2.map((n) => n.toFixed(1)).join(',')} ${p2
      .map((n) => n.toFixed(1))
      .join(',')}`;
  }
  return d;
}

/** Línea curva de una región a su puerto (se arquea hacia el océano). */
export function routePath(from: [number, number], to: [number, number]): string {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  // Normal hacia el oeste (x negativa), proporcional a la distancia
  let nx = -dy / len;
  let ny = dx / len;
  if (nx > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bend = Math.min(40, len * 0.25);
  const c = [mx + nx * bend, my + ny * bend];
  return `M${from[0].toFixed(1)},${from[1].toFixed(1)}Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${to[0].toFixed(1)},${to[1].toFixed(1)}`;
}
