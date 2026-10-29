import { DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis + sincronización con GSAP ScrollTrigger.
 * Todo corre fuera de Angular para no disparar detección de cambios en cada frame.
 * Con prefers-reduced-motion no se activa Lenis (scroll nativo).
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private lenis: Lenis | null = null;
  /** Cuántos componentes pidieron detener el scroll (loader, modales…). */
  private stopRequests = 0;
  private tick = (time: number) => this.lenis?.raf(time * 1000);

  /** true si el usuario pidió reducir movimiento. */
  readonly reducedMotion = signal(false);

  constructor() {
    const win = this.document.defaultView;
    if (!win) return;
    const mq = win.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion.set(mq.matches);
    mq.addEventListener('change', (e) => this.reducedMotion.set(e.matches));
    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  init(): void {
    if (this.lenis || !this.document.defaultView) return;
    this.zone.runOutsideAngular(() => {
      if (!this.reducedMotion()) {
        // Inercia suave: cada giro de rueda avanza un poco menos y frena de a pocos
        this.lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, smoothWheel: true });
        this.lenis.on('scroll', ScrollTrigger.update);
        if (this.stopRequests > 0) this.lenis.stop();
        gsap.ticker.add(this.tick);
        gsap.ticker.lagSmoothing(0);
      }
      // Recalcula posiciones cuando cargan las fuentes (cambian alturas)
      this.document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
  }

  /** true mientras la página se desplaza sola (navegación del menú o transición automática). */
  autoScrolling = false;
  private autoTimer?: ReturnType<typeof setTimeout>;

  /** Destino de la navegación del menú en curso (null si no hay). Las escenas fijas del camino no reaccionan. */
  navTarget: HTMLElement | null = null;
  private navTimer?: ReturnType<typeof setTimeout>;

  private navHooks = new Set<(el: HTMLElement) => void>();

  /** Avisa cuando el menú va a saltar a una sección pasando por escenas fijas (pantalla tapada). */
  onNavigate(cb: (el: HTMLElement) => void): () => void {
    this.navHooks.add(cb);
    return () => this.navHooks.delete(cb);
  }

  private markNav(el: HTMLElement, seconds: number): void {
    this.navTarget = el;
    clearTimeout(this.navTimer);
    this.navTimer = setTimeout(() => (this.navTarget = null), seconds * 1000 + 150);
  }

  private markAuto(seconds: number): void {
    this.autoScrolling = true;
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => (this.autoScrolling = false), seconds * 1000 + 150);
  }

  /**
   * Lleva a un ancla (#id) respetando el header fijo.
   * - Si en el camino no hay escenas fijas (secciones vecinas): desplazamiento suave.
   * - Si hay escenas fijas de por medio: fundido a verde, salto directo y fundido de vuelta,
   *   para no reproducir de paso las animaciones de las secciones intermedias.
   * Las secciones que empiezan con una escena fija se muestran desde su tope (sin offset).
   */
  scrollTo(target: string | HTMLElement, offset = -72): void {
    const el =
      typeof target === 'string' ? this.document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    const destination = () => {
      const top = el.getBoundingClientRect().top;
      const spacer = el.querySelector<HTMLElement>('.pin-spacer');
      const pinned = !!spacer && Math.abs(spacer.getBoundingClientRect().top - top) < 4;
      // Con escena fija arriba, unos px de más para no caer dentro de la escena anterior (redondeo)
      return top + window.scrollY + (pinned ? 3 : offset);
    };

    this.markNav(el, this.lenis ? 1.6 : 1);
    if (!this.lenis) {
      window.scrollTo({ top: destination(), behavior: this.reducedMotion() ? 'auto' : 'smooth' });
    } else if (this.crossesScene(window.scrollY, destination())) {
      this.fadeJump(el, destination);
    } else {
      this.markAuto(1.2);
      this.lenis.scrollTo(destination(), { duration: 1.2 });
    }
    // Lleva el foco a la sección para usuarios de teclado / lector de pantalla
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  /** true si entre las posiciones `from` y `to` hay alguna escena fija (pin). */
  private crossesScene(from: number, to: number): boolean {
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    return Array.from(this.document.querySelectorAll<HTMLElement>('.pin-spacer')).some((s) => {
      const r = s.getBoundingClientRect();
      const top = r.top + window.scrollY;
      return top < hi && top + r.height > lo;
    });
  }

  /** Capa verde a pantalla completa para el fundido (bajo el header, que sigue visible). */
  private veilEl?: HTMLElement;
  private veil(): HTMLElement {
    if (!this.veilEl) {
      const v = this.document.createElement('div');
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
      this.document.body.appendChild(v);
      this.veilEl = v;
    }
    return this.veilEl;
  }

  /** Fundido a verde → salto instantáneo (el destino se mide justo al saltar) → fundido de vuelta. */
  private fadeJump(el: HTMLElement, destination: () => number): void {
    const veil = this.veil();
    // Imanes y saltos automáticos de las escenas quedan en pausa durante todo el cambio
    this.markAuto(1.1);
    gsap.killTweensOf(veil);
    gsap.to(veil, {
      autoAlpha: 1,
      duration: 0.25,
      ease: 'power1.in',
      onComplete: () => {
        this.navHooks.forEach((cb) => cb(el));
        // Antes de saltar, las escenas fijas pueden tener medidas desfasadas (p. ej. si aún no se
        // ha pasado por ellas): se recalculan y se salta ya con la posición real del destino
        ScrollTrigger.refresh();
        this.lenis?.scrollTo(destination(), { immediate: true, force: true });
        ScrollTrigger.update();
        // Por si una escena cambió de alto al saltar, se corrige la posición antes de mostrar
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          this.lenis?.scrollTo(destination(), { immediate: true, force: true });
          gsap.to(veil, { autoAlpha: 0, duration: 0.4, delay: 0.1, ease: 'power1.out' });
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
  scrollToY(y: number, duration = 0.7, { soft = false } = {}): void {
    this.markAuto(duration);
    if (this.lenis) {
      this.lenis.scrollTo(y, {
        duration,
        lock: !soft,
        easing: soft
          ? (t) => -(Math.cos(Math.PI * t) - 1) / 2
          : (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      });
    } else {
      window.scrollTo({ top: y, behavior: this.reducedMotion() ? 'auto' : 'smooth' });
    }
  }

  /**
   * Corre la página `dy` px al instante sin que se note (sin cortar la inercia de Lenis).
   * Sirve para compensar cuando el contenido de arriba cambia de alto.
   */
  shiftBy(dy: number): void {
    if (this.lenis) {
      const target = this.lenis.targetScroll + dy;
      this.lenis.scrollTo(this.lenis.animatedScroll + dy, { immediate: true, force: true });
      this.lenis.scrollTo(target, { force: true });
    } else {
      window.scrollTo({ top: window.scrollY + dy, behavior: 'auto' });
    }
  }

  /** Salta `dy` px al instante y se queda ahí (corta la inercia). */
  jumpBy(dy: number): void {
    if (this.lenis) {
      this.lenis.scrollTo(this.lenis.animatedScroll + dy, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: window.scrollY + dy, behavior: 'auto' });
    }
  }

  stop(): void {
    this.stopRequests++;
    this.lenis?.stop();
  }

  start(): void {
    this.stopRequests = Math.max(0, this.stopRequests - 1);
    if (this.stopRequests === 0) {
      this.lenis?.start();
      // Al liberar el scroll puede aparecer la barra y cambiar el ancho: recalcula pins y triggers
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  private destroy(): void {
    gsap.ticker.remove(this.tick);
    this.lenis?.destroy();
    this.lenis = null;
  }
}
