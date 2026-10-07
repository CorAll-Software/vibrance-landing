import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { gsap } from 'gsap';
import { GROWING_ZONES } from '../../../data/destinos.data';
import { SmoothScrollService } from '../../../core/services/smooth-scroll.service';
import { PERU_PATH } from './peru-path';

// Proyección equirectangular usada para generar PERU_PATH (ver peru-path.ts)
const LEFT = -81.6;
const TOP = 0.2;
const K = 30;
const VB_W = 396;
const VB_H = 564;

/** Mapa del Perú con las zonas de cultivo: aparecen en secuencia una vez y muestran tooltip. */
@Component({
  selector: 'app-map-peru',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="relative mx-auto w-full max-w-[22rem]" *transloco="let t; prefix: 'origen'">
      <svg
        [attr.viewBox]="'0 0 ' + vbW + ' ' + vbH"
        class="block h-auto w-full"
        role="img"
        [attr.aria-label]="t('mapLabel')"
      >
        <path
          [attr.d]="path"
          fill="#1E3B2F"
          fill-opacity="0.12"
          stroke="#1E3B2F"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
      <ul class="absolute inset-0">
        @for (z of zones; track z.id) {
          <li class="zone absolute" [style.left.%]="z.x" [style.top.%]="z.y">
            <button
              type="button"
              class="group relative -translate-x-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full"
              [attr.aria-label]="
                t('zonas.' + z.id + '.name') + ': ' + t('zonas.' + z.id + '.crops')
              "
            >
              <span
                class="absolute size-7 rounded-full bg-hoja/25 transition-transform duration-300 group-hover:scale-125"
              ></span>
              <span class="relative size-3.5 rounded-full border-2 border-niebla bg-hoja"></span>
              <span
                role="tooltip"
                class="pointer-events-none absolute bottom-full left-1/2 mb-1 w-max -translate-x-1/2 translate-y-1 rounded-lg bg-palta px-3 py-2 text-left text-sm text-niebla opacity-0 shadow-lg transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                <strong class="block font-semibold">{{ t('zonas.' + z.id + '.name') }}</strong>
                {{ t('zonas.' + z.id + '.crops') }}
              </span>
            </button>
          </li>
        }
      </ul>
    </figure>
  `,
})
export class MapPeruComponent {
  protected readonly path = PERU_PATH;
  protected readonly vbW = VB_W;
  protected readonly vbH = VB_H;
  protected readonly zones = GROWING_ZONES.map((z) => ({
    id: z.id,
    x: (((z.lon - LEFT) * K) / VB_W) * 100,
    y: (((TOP - z.lat) * K) / VB_H) * 100,
  }));

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const scroll = inject(SmoothScrollService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (scroll.reducedMotion()) return;
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          // Los puntos aparecen en secuencia de norte a sur, una sola vez
          gsap.from('.zone', {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(2)',
            stagger: 0.18,
            scrollTrigger: { trigger: host, start: 'top 70%', once: true },
          });
        }, host);
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
