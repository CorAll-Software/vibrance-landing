import { signal } from '@preact/signals';

/** Secciones de la página en orden (ids de las anclas). */
export const SECTION_IDS = [
  'inicio',
  'origen',
  'nosotros',
  'proceso',
  'productos',
  'datos',
  'como',
  'contacto',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Segundos sin scroll tras los que se considera que el usuario se detuvo. */
const IDLE_MS = 1600;

/** Sección en la que está el lector. */
export const active = signal<SectionId>('inicio');
/** Avance 0–1 repartido entre las secciones (0 en la primera, 1 al final de la última). */
export const progress = signal(0);
/** true mientras se hace scroll y un momento después. */
export const scrolling = signal(false);

let frame = 0;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let started = false;

/** Recalcula sección activa y avance. */
function measure(): void {
  frame = 0;
  const probe = window.innerHeight * 0.35;
  const last = SECTION_IDS.length - 1;

  let index = 0;
  let within = 0;
  for (let i = 0; i <= last; i++) {
    const el = document.getElementById(SECTION_IDS[i]);
    if (!el) continue;
    // Con una escena fija, la sección vive dentro de un "pin-spacer" que sí conserva su altura
    const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
    const rect = box.getBoundingClientRect();
    if (rect.top > probe) break;
    index = i;
    within = rect.height > 0 ? Math.min(1, Math.max(0, (probe - rect.top) / rect.height)) : 0;
  }

  const doc = document.documentElement;
  const atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 4;
  if (atBottom) {
    index = last;
    within = 1;
  }

  active.value = SECTION_IDS[index];
  progress.value = Math.round(Math.min(1, (index + within) / last) * 200) / 200;
}

/**
 * Qué sección se está viendo y cuánto se avanzó (para el header y el indicador de scroll).
 * Se mide por secciones, no por la altura del documento: las escenas fijas (pin) alargan la
 * página y harían saltar una barra de scroll normal.
 */
export function initActiveSection(): void {
  if (started) return;
  started = true;
  const onScroll = () => {
    scrolling.value = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => (scrolling.value = false), IDLE_MS);
    if (!frame) frame = requestAnimationFrame(measure);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Medida inicial (el navegador puede restaurar el scroll al recargar)
  requestAnimationFrame(measure);
}
