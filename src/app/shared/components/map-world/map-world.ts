import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { DESTINATIONS, GeoPoint, ORIGIN } from '../../../data/destinos.data';
import { productsForMarket } from '../../../data/mercados.data';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';

// Debe coincidir con public/svg/world-dots.svg (equirectangular, lat 84 → -58)
const VB_W = 1000;
const VB_H = 394;
const LAT_TOP = 84;
const LAT_BOTTOM = -58;

const project = (p: GeoPoint) => ({
  x: ((p.lon + 180) / 360) * VB_W,
  y: ((LAT_TOP - p.lat) / (LAT_TOP - LAT_BOTTOM)) * VB_H,
});

/** Mapa mundial de puntos con los mercados (y cuántos productos tienen acceso) y rutas desde el Perú. */
@Component({
  selector: 'app-map-world',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="relative w-full" *transloco="let t; prefix: 'datos'">
      <img
        src="svg/world-dots.svg"
        alt=""
        width="1000"
        height="394"
        class="block h-auto w-full"
        loading="lazy"
      />
      <svg
        [attr.viewBox]="'0 0 ' + vbW + ' ' + vbH"
        class="absolute inset-0 h-full w-full overflow-visible"
        role="img"
        [attr.aria-label]="t('mapLabel')"
      >
        @for (r of routes; track r.id) {
          <path
            class="route"
            [attr.d]="r.d"
            fill="none"
            stroke="#3B3F7A"
            stroke-opacity="0.45"
            stroke-width="1.4"
            stroke-dasharray="1 0"
            pathLength="1"
          />
        }
        <circle [attr.cx]="origin.x" [attr.cy]="origin.y" r="6" fill="#4F7A3A" />
        <circle
          [attr.cx]="origin.x"
          [attr.cy]="origin.y"
          r="12"
          fill="#4F7A3A"
          fill-opacity="0.25"
        />
      </svg>
      <ul class="absolute inset-0">
        @for (d of markers; track d.id) {
          <li class="marker absolute" [style.left.%]="d.left" [style.top.%]="d.top">
            <button
              type="button"
              class="group relative grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              [attr.aria-label]="
                t('destinos.' + d.id) + ': ' + t('marketProducts', { n: d.products })
              "
            >
              <span
                class="size-3 rounded-full bg-arandano ring-4 ring-arandano/20 transition-transform duration-200 group-hover:scale-150"
              ></span>
              <span
                role="tooltip"
                class="pointer-events-none absolute bottom-full left-1/2 w-max -translate-x-1/2 translate-y-1 rounded-md bg-arandano px-2.5 py-1 text-sm font-medium text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                <strong class="block font-semibold">{{ t('destinos.' + d.id) }}</strong>
                <span class="text-xs text-white/85">{{
                  t('marketProducts', { n: d.products })
                }}</span>
              </span>
            </button>
          </li>
        }
      </ul>
    </figure>
  `,
})
export class MapWorldComponent {
  /** true: la sección padre controla la animación (escena de Origen). */
  readonly managed = input(false);
  protected readonly vbW = VB_W;
  protected readonly vbH = VB_H;
  protected readonly origin = project(ORIGIN);
  protected readonly markers = DESTINATIONS.map((d) => {
    const p = project(d);
    return {
      id: d.id,
      left: (p.x / VB_W) * 100,
      top: (p.y / VB_H) * 100,
      products: productsForMarket(d.id).length,
    };
  });
  /** Curvas cuadráticas desde Perú a cada destino. */
  protected readonly routes = DESTINATIONS.map((d) => {
    const a = this.origin;
    const b = project(d);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.22;
    return { id: d.id, d: `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}` };
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (this.managed() || scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          this.prepare();
          gsap
            .timeline({ scrollTrigger: { trigger: this.host, start: 'top 75%', once: true } })
            .add(this.phase());
        }, this.host);
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  /** Estado inicial: sin rutas ni destinos. */
  prepare(): void {
    gsap.set(this.host.querySelectorAll('.route'), { strokeDasharray: '0 1' });
    gsap.set(this.host.querySelectorAll('.marker'), { scale: 0, opacity: 0 });
  }

  /** Las rutas se dibujan desde el Perú y luego aparecen los destinos. */
  phase(): gsap.core.Timeline {
    return gsap
      .timeline()
      .to(this.host.querySelectorAll('.route'), {
        strokeDasharray: '1 0',
        duration: 1.2,
        ease: 'power2.inOut',
        stagger: 0.06,
      })
      .to(
        this.host.querySelectorAll('.marker'),
        { scale: 1, opacity: 1, duration: 0.35, stagger: 0.05 },
        '-=0.6',
      );
  }
}
