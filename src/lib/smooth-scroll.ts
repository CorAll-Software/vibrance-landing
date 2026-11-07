import { signal } from '@preact/signals';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis + sincronización con GSAP ScrollTrigger.
 * Con prefers-reduced-motion no se activa Lenis (scroll nativo).
 */

/** true si el usuario pidió reducir movimiento. */
export const reducedMotion = signal(false);

let lenis: Lenis | null = null;
/** Cuántos componentes pidieron detener el scroll (loader, modales…). */
let stopRequests = 0;
const tick = (time: number) => lenis?.raf(time * 1000);
let mqStarted = false;

/** Lee prefers-reduced-motion (se llama antes de cualquier uso en el cliente). */
export function initMotionPreference(): void {
  if (mqStarted) return;
  mqStarted = true;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.value = mq.matches;
  mq.addEventListener('change', (e) => (reducedMotion.value = e.matches));
}

export function initSmoothScroll(): void {
  if (lenis) return;
  initMotionPreference();
  if (!reducedMotion.value) {
    // Inercia suave: cada giro de rueda avanza un poco menos y frena de a pocos
    lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    if (stopRequests > 0) lenis.stop();
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }
  // Recalcula posiciones cuando cargan las fuentes (cambian alturas)
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** true mientras la página se desplaza sola (navegación del menú o transición automática). */
export const state = {
  autoScrolling: false,
  /** Destino de la navegación del menú en curso (null si no hay). Las escenas fijas del camino no reaccionan. */
  navTarget: null as HTMLElement | null,
};
let autoTimer: ReturnType<typeof setTimeout> | undefined;
let navTimer: ReturnType<typeof setTimeout> | undefined;

const navHooks = new Set<(el: HTMLElement) => void>();

/** Avisa cuando el menú va a saltar a una sección pasando por escenas fijas (pantalla tapada). */
export function onNavigate(cb: (el: HTMLElement) => void): () => void {
  navHooks.add(cb);
  return () => navHooks.delete(cb);
}

function markNav(el: HTMLElement, seconds: number): void {
  state.navTarget = el;
  clearTimeout(navTimer);
  navTimer = setTimeout(() => (state.navTarget = null), seconds * 1000 + 150);
}

function markAuto(seconds: number): void {
  state.autoScrolling = true;
  clearTimeout(autoTimer);
  autoTimer = setTimeout(() => (state.autoScrolling = false), seconds * 1000 + 150);
}

/**
 * Lleva a un ancla (#id) respetando el header fijo.
 * - Si en el camino no hay escenas fijas (secciones vecinas): desplazamiento suave.
 * - Si hay escenas fijas de por medio: fundido a verde, salto directo y fundido de vuelta,
 *   para no reproducir de paso las animaciones de las secciones intermedias.
 * Las secciones que empiezan con una escena fija se muestran desde su tope (sin offset).
 */
export function scrollTo(target: string | HTMLElement, offset = -72): void {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const destination = () => {
    const top = el.getBoundingClientRect().top;
    const spacer = el.querySelector<HTMLElement>('.pin-spacer');
    const pinned = !!spacer && Math.abs(spacer.getBoundingClientRect().top - top) < 4;
    // Con escena fija arriba, unos px de más para no caer dentro de la escena anterior (redondeo)
    return top + window.scrollY + (pinned ? 3 : offset);
  };

  markNav(el, lenis ? 1.6 : 1);
  if (!lenis) {
    window.scrollTo({ top: destination(), behavior: reducedMotion.value ? 'auto' : 'smooth' });
  } else if (crossesScene(window.scrollY, destination())) {
    fadeJump(el, destination);
  } else {
    markAuto(1.2);
    lenis.scrollTo(destination(), { duration: 1.2 });
  }
  // Lleva el foco a la sección para usuarios de teclado / lector de pantalla
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** true si entre las posiciones `from` y `to` hay alguna escena fija (pin). */
function crossesScene(from: number, to: number): boolean {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return Array.from(document.querySelectorAll<HTMLElement>('.pin-spacer')).some((s) => {
    const r = s.getBoundingClientRect();
    const top = r.top + window.scrollY;
    return top < hi && top + r.height > lo;
  });
}

/** Capa verde a pantalla completa para el fundido (bajo el header, que sigue visible). */
let veilEl: HTMLElement | undefined;
function veil(): HTMLElement {
  if (!veilEl) {
    const v = document.createElement('div');
    v.setAttribute('aria-hidden', 'true');
    Object.assign(v.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '45',
      background: 'var(--color-palta)',
      opacity: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
    });
    document.body.appendChild(v);
    veilEl = v;
  }
  return veilEl;
}

/** Fundido a verde → salto instantáneo (el destino se mide justo al saltar) → fundido de vuelta. */
function fadeJump(el: HTMLElement, destination: () => number): void {
  const v = veil();
  // Imanes y saltos automáticos de las escenas quedan en pausa durante todo el cambio
  markAuto(1.1);
  gsap.killTweensOf(v);
  gsap.to(v, {
    autoAlpha: 1,
    duration: 0.25,
    ease: 'power1.in',
    onComplete: () => {
      navHooks.forEach((cb) => cb(el));
      // Antes de saltar, las escenas fijas pueden tener medidas desfasadas (p. ej. si aún no se
      // ha pasado por ellas): se recalculan y se salta ya con la posición real del destino
      ScrollTrigger.refresh();
      lenis?.scrollTo(destination(), { immediate: true, force: true });
      ScrollTrigger.update();
      // Por si una escena cambió de alto al saltar, se corrige la posición antes de mostrar
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis?.scrollTo(destination(), { immediate: true, force: true });
        gsap.to(v, { autoAlpha: 0, duration: 0.4, delay: 0.1, ease: 'power1.out' });
      });
    },
  });
}

/**
 * Desplaza a una posición vertical exacta (px) con una transición completa.
 * Mientras dura, el scroll del usuario queda en pausa para que la transición no se corte.
 * Con `soft` (imanes): curva suave al empezar y al terminar (sin tirones) y el usuario puede
 * interrumpirla con su propio scroll (no se siente como si la página lo "jalara").
 */
export function scrollToY(y: number, duration = 0.7, { soft = false } = {}): void {
  markAuto(duration);
  if (lenis) {
    lenis.scrollTo(y, {
      duration,
      lock: !soft,
      easing: soft
        ? (t) => -(Math.cos(Math.PI * t) - 1) / 2
        : (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
  } else {
    window.scrollTo({ top: y, behavior: reducedMotion.value ? 'auto' : 'smooth' });
  }
}

/**
 * Corre la página `dy` px al instante sin que se note (sin cortar la inercia de Lenis).
 * Sirve para compensar cuando el contenido de arriba cambia de alto.
 */
export function shiftBy(dy: number): void {
  if (lenis) {
    const target = lenis.targetScroll + dy;
    lenis.scrollTo(lenis.animatedScroll + dy, { immediate: true, force: true });
    lenis.scrollTo(target, { force: true });
  } else {
    window.scrollTo({ top: window.scrollY + dy, behavior: 'auto' });
  }
}

/** Salta `dy` px al instante y se queda ahí (corta la inercia). */
export function jumpBy(dy: number): void {
  if (lenis) {
    lenis.scrollTo(lenis.animatedScroll + dy, { immediate: true, force: true });
  } else {
    window.scrollTo({ top: window.scrollY + dy, behavior: 'auto' });
  }
}

export function stop(): void {
  stopRequests++;
  lenis?.stop();
}

export function start(): void {
  stopRequests = Math.max(0, stopRequests - 1);
  if (stopRequests === 0) {
    lenis?.start();
    // Al liberar el scroll puede aparecer la barra y cambiar el ancho: recalcula pins y triggers
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
}
