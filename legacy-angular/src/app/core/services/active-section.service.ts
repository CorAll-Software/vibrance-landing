import { DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

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

/**
 * Qué sección se está viendo y cuánto se avanzó (para el header y el indicador de scroll).
 * Se mide por secciones, no por la altura del documento: las escenas fijas (pin) alargan la
 * página y harían saltar una barra de scroll normal.
 */
@Injectable({ providedIn: 'root' })
export class ActiveSectionService {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private frame = 0;
  private idleTimer?: ReturnType<typeof setTimeout>;

  /** Sección en la que está el lector. */
  readonly active = signal<SectionId>('inicio');
  /** Avance 0–1 repartido entre las secciones (0 en la primera, 1 al final de la última). */
  readonly progress = signal(0);
  /** true mientras se hace scroll y un momento después. */
  readonly scrolling = signal(false);

  constructor() {
    const win = this.document.defaultView;
    if (!win) return;
    this.zone.runOutsideAngular(() => {
      const onScroll = () => {
        this.scrolling.set(true);
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.scrolling.set(false), IDLE_MS);
        if (!this.frame) this.frame = win.requestAnimationFrame(() => this.measure());
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', onScroll, { passive: true });
      // Medida inicial (el navegador puede restaurar el scroll al recargar)
      win.requestAnimationFrame(() => this.measure());
      inject(DestroyRef).onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        win.removeEventListener('resize', onScroll);
        win.cancelAnimationFrame(this.frame);
        clearTimeout(this.idleTimer);
      });
    });
  }

  /** Recalcula sección activa y avance. */
  private measure(): void {
    this.frame = 0;
    const win = this.document.defaultView;
    if (!win) return;
    const probe = win.innerHeight * 0.35;
    const last = SECTION_IDS.length - 1;

    let index = 0;
    let within = 0;
    for (let i = 0; i <= last; i++) {
      const el = this.document.getElementById(SECTION_IDS[i]);
      if (!el) continue;
      // Con una escena fija, la sección vive dentro de un "pin-spacer" que sí conserva su altura
      const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
      const rect = box.getBoundingClientRect();
      if (rect.top > probe) break;
      index = i;
      within = rect.height > 0 ? Math.min(1, Math.max(0, (probe - rect.top) / rect.height)) : 0;
    }

    const doc = this.document.documentElement;
    const atBottom = win.scrollY + win.innerHeight >= doc.scrollHeight - 4;
    if (atBottom) {
      index = last;
      within = 1;
    }

    this.active.set(SECTION_IDS[index]);
    this.progress.set(Math.round(Math.min(1, (index + within) / last) * 200) / 200);
  }
}
