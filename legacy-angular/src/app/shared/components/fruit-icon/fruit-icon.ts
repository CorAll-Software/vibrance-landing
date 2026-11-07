import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProductId } from '../../../data/productos.data';

let seq = 0;

/** Puntos de la piel de la mandarina (poros), fijos para que se vean igual siempre. */
const PORES = [
  [22, 26],
  [30, 21],
  [40, 24],
  [46, 33],
  [18, 36],
  [26, 33],
  [36, 31],
  [44, 42],
  [21, 45],
  [30, 42],
  [38, 39],
  [34, 50],
  [26, 52],
  [42, 50],
  [48, 26],
  [16, 30],
];

/** Uvas del racimo (x, y, radio), de atrás hacia adelante. */
const GRAPES = [
  [22, 17, 7.2],
  [34, 15, 7.4],
  [46, 18, 7.2],
  [16, 28, 7],
  [28, 27, 7.6],
  [40, 27, 7.6],
  [51, 29, 6.8],
  [22, 38, 7.4],
  [34, 38, 7.6],
  [46, 39, 7],
  [28, 48, 7.2],
  [40, 48, 7],
  [34, 57, 6.4],
];

/**
 * Ilustración de cada producto con volumen (degradados, brillos y sombras).
 * Se usa en el mapa, sus tarjetas y el árbol de Origen. Decorativa.
 * Cada instancia usa ids propios para sus degradados.
 */
@Component({
  selector: 'app-fruit-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 64 64" [attr.width]="size()" [attr.height]="size()" class="block">
      <defs>
        <!-- Brillo genérico -->
        <radialGradient [attr.id]="g('hl')" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#fff" stop-opacity="0.85" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <!-- Hoja -->
        <linearGradient [attr.id]="g('leaf')" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#2F5524" />
          <stop offset="0.55" stop-color="#4F7A3A" />
          <stop offset="1" stop-color="#8DBF5A" />
        </linearGradient>
      </defs>

      @switch (fruit()) {
        @case ('mango') {
          <defs>
            <radialGradient [attr.id]="g('mb')" cx="0.38" cy="0.45" r="0.72">
              <stop offset="0" stop-color="#FFE48A" />
              <stop offset="0.45" stop-color="#F8B934" />
              <stop offset="0.82" stop-color="#EA8A2C" />
              <stop offset="1" stop-color="#C75A27" />
            </radialGradient>
            <radialGradient [attr.id]="g('mr')" cx="0.82" cy="0.18" r="0.62">
              <stop offset="0" stop-color="#D93A35" stop-opacity="0.9" />
              <stop offset="1" stop-color="#D93A35" stop-opacity="0" />
            </radialGradient>
            <radialGradient [attr.id]="g('mg')" cx="0.12" cy="0.92" r="0.5">
              <stop offset="0" stop-color="#93BF4C" stop-opacity="0.75" />
              <stop offset="1" stop-color="#93BF4C" stop-opacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M37.5 12.5c10.5 3 16.5 13 15.5 25-1 13-11 22-23 22C16.5 59.5 8.5 51 9.5 41c.7-7 5.2-10 9.3-14.2 5-5 7.2-15.8 18.7-14.3z"
            [attr.fill]="u('mb')"
          />
          <path
            d="M37.5 12.5c10.5 3 16.5 13 15.5 25-1 13-11 22-23 22C16.5 59.5 8.5 51 9.5 41c.7-7 5.2-10 9.3-14.2 5-5 7.2-15.8 18.7-14.3z"
            [attr.fill]="u('mr')"
          />
          <path
            d="M37.5 12.5c10.5 3 16.5 13 15.5 25-1 13-11 22-23 22C16.5 59.5 8.5 51 9.5 41c.7-7 5.2-10 9.3-14.2 5-5 7.2-15.8 18.7-14.3z"
            [attr.fill]="u('mg')"
          />
          <ellipse
            cx="24"
            cy="31"
            rx="5"
            ry="9.5"
            transform="rotate(28 24 31)"
            [attr.fill]="u('hl')"
            opacity="0.7"
          />
          <path
            d="M37.6 12.6c.8-2.6 2-4.6 3.8-6"
            stroke="#5E3F22"
            stroke-width="2.4"
            stroke-linecap="round"
            fill="none"
          />
          <path d="M41 7.5c5-6 13.5-6.8 18.5-3.8C55 9.6 48 11.6 41 7.5z" [attr.fill]="u('leaf')" />
          <path
            d="M41 7.5c6-1.3 11.6-2.6 18.5-3.8"
            stroke="#24451B"
            stroke-width="0.8"
            opacity="0.6"
            fill="none"
          />
        }
        @case ('arandano') {
          <defs>
            <radialGradient [attr.id]="g('bb')" cx="0.34" cy="0.3" r="0.8">
              <stop offset="0" stop-color="#8592CF" />
              <stop offset="0.35" stop-color="#46519A" />
              <stop offset="0.75" stop-color="#262B62" />
              <stop offset="1" stop-color="#14163A" />
            </radialGradient>
            <radialGradient [attr.id]="g('bl')" cx="0.5" cy="0.42" r="0.6">
              <stop offset="0" stop-color="#C3CDEB" stop-opacity="0.38" />
              <stop offset="1" stop-color="#C3CDEB" stop-opacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="23" r="13" [attr.fill]="u('bb')" />
          <circle cx="20" cy="23" r="13" [attr.fill]="u('bl')" />
          <path
            d="M17 12.5l1.4-2.2 1 2.3 2.4-.6-1.2 2.1h-4.4l-1.1-2.1 2.3.6z"
            fill="#14163A"
            opacity="0.9"
          />
          <circle cx="36" cy="38" r="21" [attr.fill]="u('bb')" />
          <circle cx="36" cy="38" r="21" [attr.fill]="u('bl')" />
          <g transform="translate(39 22)">
            <path
              d="M0-5.5l1.8 3.3 3.6-.9-1.6 3.4 2.6 2.6-3.7.2-.9 3.6L0 4.2l-1.8 2.5-.9-3.6-3.7-.2 2.6-2.6-1.6-3.4 3.6.9z"
              fill="#14163A"
            />
            <circle r="2" fill="#2E3470" />
          </g>
          <ellipse
            cx="27"
            cy="29"
            rx="5.5"
            ry="3.6"
            transform="rotate(-30 27 29)"
            [attr.fill]="u('hl')"
            opacity="0.55"
          />
        }
        @case ('palta') {
          <defs>
            <linearGradient [attr.id]="g('sk')" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#3D5E26" />
              <stop offset="1" stop-color="#16260E" />
            </linearGradient>
            <radialGradient [attr.id]="g('fl')" cx="0.5" cy="0.55" r="0.62">
              <stop offset="0" stop-color="#F4EDA8" />
              <stop offset="0.6" stop-color="#D1DC73" />
              <stop offset="0.9" stop-color="#93B640" />
              <stop offset="1" stop-color="#6E9530" />
            </radialGradient>
            <radialGradient [attr.id]="g('sd')" cx="0.36" cy="0.32" r="0.75">
              <stop offset="0" stop-color="#C48A50" />
              <stop offset="0.55" stop-color="#83501F" />
              <stop offset="1" stop-color="#4A2A10" />
            </radialGradient>
          </defs>
          <path
            d="M32 3.5c-8.4 0-12.3 8-13.3 16.2-.8 6.2-9.2 11-9.2 22.2C9.5 53 19.6 60.5 32 60.5S54.5 53 54.5 41.9c0-11.2-8.4-16-9.2-22.2C44.3 11.5 40.4 3.5 32 3.5z"
            [attr.fill]="u('sk')"
          />
          <path
            d="M32 7.8c-6.3 0-9.6 7.1-10.4 13.8-.7 5.4-8.1 9.7-8.1 19.6 0 9.3 8.4 15.2 18.5 15.2s18.5-5.9 18.5-15.2c0-9.9-7.4-14.2-8.1-19.6C41.6 14.9 38.3 7.8 32 7.8z"
            [attr.fill]="u('fl')"
          />
          <circle cx="32" cy="40" r="10.5" [attr.fill]="u('sd')" />
          <ellipse
            cx="28.5"
            cy="36"
            rx="3.6"
            ry="2.4"
            transform="rotate(-30 28.5 36)"
            [attr.fill]="u('hl')"
            opacity="0.6"
          />
        }
        @case ('uva') {
          <defs>
            <radialGradient [attr.id]="g('gr')" cx="0.34" cy="0.3" r="0.78">
              <stop offset="0" stop-color="#E37C9C" />
              <stop offset="0.4" stop-color="#B23A62" />
              <stop offset="0.8" stop-color="#701A3C" />
              <stop offset="1" stop-color="#46102A" />
            </radialGradient>
          </defs>
          <path
            d="M34 9V3.5M34 6c-3-1-6-1-8 0"
            stroke="#6B4A2A"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <path d="M35 5.5c4.5-4 11-4 14.5-1.5-3.8 4.3-9.6 5-14.5 1.5z" [attr.fill]="u('leaf')" />
          @for (p of grapes; track $index) {
            <circle [attr.cx]="p[0]" [attr.cy]="p[1]" [attr.r]="p[2]" [attr.fill]="u('gr')" />
            <ellipse
              [attr.cx]="p[0] - p[2] * 0.35"
              [attr.cy]="p[1] - p[2] * 0.4"
              [attr.rx]="p[2] * 0.3"
              [attr.ry]="p[2] * 0.2"
              transform-origin="center"
              [attr.fill]="u('hl')"
              opacity="0.7"
            />
          }
        }
        @case ('mandarina') {
          <defs>
            <radialGradient [attr.id]="g('md')" cx="0.36" cy="0.32" r="0.78">
              <stop offset="0" stop-color="#FFCB75" />
              <stop offset="0.42" stop-color="#F99D2E" />
              <stop offset="0.82" stop-color="#E5721A" />
              <stop offset="1" stop-color="#B9500C" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="37" r="23.5" [attr.fill]="u('md')" />
          <g fill="#FFD9A0" opacity="0.35">
            @for (p of pores; track $index) {
              <circle [attr.cx]="p[0]" [attr.cy]="p[1]" r="0.8" />
            }
          </g>
          <ellipse
            cx="24"
            cy="27"
            rx="7"
            ry="4.5"
            transform="rotate(-35 24 27)"
            [attr.fill]="u('hl')"
            opacity="0.6"
          />
          <ellipse cx="32" cy="14.2" rx="3.4" ry="1.6" fill="#B9500C" opacity="0.55" />
          <path
            d="M32 14c.4-3 1.4-5.2 3-6.6"
            stroke="#5E3F22"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
          />
          <path
            d="M34 8.6c4.6-5.6 12.4-6.4 17-3.4-4.2 5.4-10.6 7.4-17 3.4z"
            [attr.fill]="u('leaf')"
          />
          <path
            d="M34 8.6c5.4-1.2 10.6-2.2 17-3.4"
            stroke="#24451B"
            stroke-width="0.8"
            opacity="0.6"
            fill="none"
          />
        }
        @case ('kion') {
          <defs>
            <radialGradient [attr.id]="g('kn')" cx="0.4" cy="0.3" r="0.8">
              <stop offset="0" stop-color="#F3DDB4" />
              <stop offset="0.55" stop-color="#D6AD70" />
              <stop offset="1" stop-color="#A3733C" />
            </radialGradient>
          </defs>
          <g [attr.fill]="u('kn')">
            <ellipse cx="46" cy="25" rx="9.5" ry="7" transform="rotate(-40 46 25)" />
            <ellipse cx="14" cy="27" rx="8.5" ry="6.2" transform="rotate(35 14 27)" />
            <ellipse cx="30" cy="22" rx="7.5" ry="6.2" />
            <ellipse cx="47" cy="46" rx="9.5" ry="6.4" transform="rotate(20 47 46)" />
            <ellipse cx="28" cy="38" rx="19" ry="11" transform="rotate(-12 28 38)" />
          </g>
          <g fill="#E9A9A0" opacity="0.85">
            <ellipse cx="52" cy="19" rx="2.4" ry="1.8" />
            <ellipse cx="9" cy="23" rx="2.2" ry="1.7" />
            <ellipse cx="54" cy="48" rx="2.2" ry="1.7" />
          </g>
          <g fill="none" stroke="#8C5F2E" stroke-width="1" stroke-linecap="round" opacity="0.55">
            <path d="M18 31.5c1.6 5 1.6 9.5 0 13.5" />
            <path d="M27 28.5c1.8 5.4 1.8 11 0 16" />
            <path d="M36 28c1.6 5 1.6 10 0 14.5" />
            <path d="M44 41c1.2 2.8 1.2 6 0 9" />
          </g>
          <ellipse
            cx="22"
            cy="33"
            rx="7"
            ry="2.6"
            transform="rotate(-12 22 33)"
            [attr.fill]="u('hl')"
            opacity="0.45"
          />
        }
      }
    </svg>
  `,
})
export class FruitIconComponent {
  readonly fruit = input.required<ProductId>();
  readonly size = input(24);

  private readonly id = `fi${++seq}`;
  protected readonly pores = PORES;
  protected readonly grapes = GRAPES;

  /** id de un degradado propio de esta instancia. */
  protected g(name: string): string {
    return `${this.id}-${name}`;
  }
  /** Referencia `url(#…)` a un degradado propio. */
  protected u(name: string): string {
    return `url(#${this.id}-${name})`;
  }
}
