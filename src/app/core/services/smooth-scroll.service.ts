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
        this.lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        this.lenis.on('scroll', ScrollTrigger.update);
        if (this.stopRequests > 0) this.lenis.stop();
        gsap.ticker.add(this.tick);
        gsap.ticker.lagSmoothing(0);
      }
      // Recalcula posiciones cuando cargan las fuentes (cambian alturas)
      this.document.fonts?.ready.then(() => ScrollTrigger.refresh());
    });
  }

  /** Desplaza a un ancla (#id) respetando el header fijo. */
  scrollTo(target: string | HTMLElement, offset = -72): void {
    const el =
      typeof target === 'string' ? this.document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    if (this.lenis) {
      this.lenis.scrollTo(el, { offset, duration: 1.2 });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: this.reducedMotion() ? 'auto' : 'smooth' });
    }
    // Lleva el foco a la sección para usuarios de teclado / lector de pantalla
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  stop(): void {
    this.stopRequests++;
    this.lenis?.stop();
  }

  start(): void {
    this.stopRequests = Math.max(0, this.stopRequests - 1);
    if (this.stopRequests === 0) this.lenis?.start();
  }

  private destroy(): void {
    gsap.ticker.remove(this.tick);
    this.lenis?.destroy();
    this.lenis = null;
  }
}
