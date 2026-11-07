import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { GROWING_ZONES, PORTS } from '../../../data/destinos.data';
import { PRODUCTS } from '../../../data/productos.data';
import { LanguageService } from '../../../core/services/language.service';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';
import { UiStateService } from '../../../core/services/ui-state.service';
import { FruitIconComponent } from '../fruit-icon/fruit-icon';
import { PERU_PATH } from './peru-path';
import { COAST_AREA, JUNGLE_AREA, VB_H, VB_W, VB_X, VB_Y, project, toPercent } from './peru-geo';

/** Colores de las regiones (leyenda; el mapa usa degradados de estos tonos). */
const REGION_COLORS = { costa: '#F3E2AF', sierra: '#C28449', selva: '#679448' } as const;

/**
 * Dónde se clava el pin de cada región (lon, lat): un poco tierra adentro para que la punta caiga
 * sobre el país y no en el borde; Lima y Junín, escalonados para que no se pisen.
 */
const PIN_AT: Record<string, [number, number]> = {
  piura: [-80.1, -5.3],
  la_libertad: [-78.4, -8.1],
  lima: [-76.6, -12.3],
  junin: [-74.6, -10.4],
  ica: [-75.2, -14.7],
};

/** Orden en que aparecen las regiones (de norte a sur; Lima al final). */
const POP_ORDER = ['piura', 'la_libertad', 'junin', 'ica', 'lima'];

/**
 * Mapa del Perú: regiones naturales con relieve, puertos de embarque y un ícono de fruta por
 * región de origen (con pulso y mini tarjeta al pasar el cursor o tocar; cada fruta de la tarjeta abre su detalle).
 * Fases: 0 aparece el país · 1 se marcan las regiones del norte al sur · 2 Lima.
 * Si `managed` es true, la sección padre arma la línea de tiempo; si no, se anima sola.
 */
@Component({
  selector: 'app-map-peru',
  imports: [TranslocoDirective, TranslocoPipe, FruitIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map-peru.html',
  styleUrl: './map-peru.css',
})
export class MapPeruComponent {
  readonly managed = input(false);
  protected readonly vb = { x: VB_X, y: VB_Y, w: VB_W, h: VB_H };
  protected readonly lang = inject(LanguageService);
  protected readonly path = PERU_PATH;
  protected readonly coast = COAST_AREA;
  protected readonly jungle = JUNGLE_AREA;
  protected readonly colors = REGION_COLORS;
  protected readonly viewBox = `${VB_X} ${VB_Y} ${VB_W} ${VB_H}`;
  protected readonly regions = ['costa', 'sierra', 'selva'] as const;

  protected readonly zones = GROWING_ZONES.map((z) => {
    const pos = toPercent(...(PIN_AT[z.id] ?? [z.lon, z.lat]));
    return {
      ...z,
      ...pos,
      // La tarjeta se alinea según el lado del mapa para no salirse de la pantalla
      align: pos.x < 38 ? 'start' : pos.x > 62 ? 'end' : 'center',
      // Cerca del borde superior la tarjeta se abre hacia abajo
      below: pos.y < 33,
      image: PRODUCTS.find((p) => p.id === z.fruits[0])!.image,
    };
  });

  protected readonly ports = PORTS.map((p) => {
    const [x, y] = project(p.lon, p.lat);
    return { id: p.id, x, y };
  });

  /** Región abierta por toque/clic (en pantallas táctiles no hay hover). */
  protected readonly active = signal<string | null>(null);

  protected toggle(id: string): void {
    this.active.update((cur) => (cur === id ? null : id));
  }

  /** Cierra la tarjeta cuando el foco sale de la región (no al pasar del marcador a una fruta). */
  protected onFocusOut(event: FocusEvent, id: string): void {
    const zone = event.currentTarget as HTMLElement;
    if (zone.contains(event.relatedTarget as Node | null)) return;
    if (this.active() === id) this.active.set(null);
  }

  /** Abre el detalle de la fruta (mismo modal que el catálogo). */
  protected readonly ui = inject(UiStateService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly q = gsap.utils.selector(this.host);

  constructor() {
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (this.managed() || scroll.reducedMotion()) return;
      // Modo independiente (móvil): las fases avanzan mientras el mapa cruza la pantalla
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          this.prepare();
          const tl = gsap.timeline({
            scrollTrigger: { trigger: this.host, start: 'top 80%', end: 'bottom 40%', scrub: 0.8 },
          });
          [0, 1, 2].forEach((n) => tl.add(this.phase(n)));
        }, this.host);
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  /** Estado inicial: mapa vacío, sin frutas. */
  prepare(): void {
    gsap.set(this.q('.region'), { opacity: 0 });
    gsap.set(this.q('.port'), { opacity: 0 });
    gsap.set(this.q('.zone'), { scale: 0, opacity: 0 });
  }

  /** Línea de tiempo de una fase (sin scroll propio). */
  phase(n: number): gsap.core.Timeline {
    const q = this.q;
    const tl = gsap.timeline();
    switch (n) {
      case 0: // Aparece el Perú: costa, sierra y selva; y los puertos
        tl.to(q('.region'), { opacity: 1, duration: 0.6, stagger: 0.15 }).to(
          q('.port'),
          { opacity: 1, duration: 0.3, stagger: 0.1 },
          '-=0.2',
        );
        break;
      case 1: // Se marcan las regiones de norte a sur
        for (const id of POP_ORDER.slice(0, 4)) this.popZone(id, this.popAt(id).at, tl);
        tl.to({}, { duration: 0.1 }, 0.9);
        break;
      case 2: // Lima
        this.popZone('lima', this.popAt('lima').at, tl);
        tl.to({}, { duration: 0.1 }, 0.9);
        break;
    }
    return tl;
  }

  /**
   * En qué fase y en qué punto de esa fase (0–1) aparece la fruta de una región.
   * Sirve para sincronizar el vuelo de cada fruta hacia la cesta.
   */
  popAt(id: string): { phase: number; at: number } {
    if (id === 'lima') return { phase: 2, at: 0.2 };
    return { phase: 1, at: POP_ORDER.indexOf(id) * 0.24 };
  }

  /** Marcador (círculo con la fruta) de una región. */
  markerEl(id: string): HTMLElement {
    return this.host.querySelector<HTMLElement>(`.zone[data-id="${id}"] .marker`)!;
  }

  private popZone(id: string, at: number, tl: gsap.core.Timeline): void {
    tl.to(
      this.q(`.zone[data-id="${id}"]`),
      { scale: 1, opacity: 1, duration: 0.15, ease: 'back.out(2)' },
      at,
    );
  }
}
