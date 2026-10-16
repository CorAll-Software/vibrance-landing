import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

type Term = 'fob' | 'cfr' | 'cif';

/** Hasta qué parada del recorrido llega lo que cubre Vibrance (0 planta … 3 destino). */
const REACH: Record<Term, number> = { fob: 2, cfr: 3, cif: 3 };

/**
 * Cómo trabajamos / preguntas frecuentes: Incoterms, volumen mínimo, pagos y puerto.
 * Los Incoterms se explican con un recorrido Planta → Callao → a bordo → destino: al elegir
 * FOB, CFR o CIF se ilumina el tramo que cubre Vibrance (y el seguro marítimo en CIF).
 * Al llegar a la vista recorre solo los tres; si el usuario elige uno, se detiene.
 */
@Component({
  selector: 'app-como-trabajamos',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="como"
      class="bg-niebla py-24 md:py-36"
      aria-labelledby="como-title"
      *transloco="let t; prefix: 'como'"
    >
      <div class="container-page">
        <div class="grid gap-6 md:grid-cols-12 md:items-end">
          <h2
            data-reveal
            id="como-title"
            class="text-4xl leading-[1.05] font-bold md:col-span-6 md:text-6xl"
          >
            {{ t('heading') }}
          </h2>
          <p data-reveal class="measure text-lg text-palta/75 md:col-span-5 md:col-start-8">
            {{ t('intro') }}
          </p>
        </div>

        <!-- Incoterms: qué tramo del recorrido cubre Vibrance -->
        <div #panel data-reveal class="inco mt-14 rounded-3xl bg-palta p-7 text-niebla md:p-12">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h3 class="font-display text-2xl font-semibold md:text-3xl">
                {{ t('items.incoterms.q') }}
              </h3>
              <p class="mt-2 text-niebla/75">{{ t('inco.hint') }}</p>
            </div>
            <div class="inco-tabs" role="tablist" [attr.aria-label]="t('items.incoterms.q')">
              @for (k of terms; track k) {
                <button
                  type="button"
                  role="tab"
                  class="inco-tab"
                  [class.is-active]="active() === k"
                  [attr.aria-selected]="active() === k"
                  (click)="choose(k)"
                >
                  {{ k.toUpperCase() }}
                </button>
              }
            </div>
          </div>

          <!-- Recorrido -->
          <div class="route" [attr.data-reach]="reach()" [class.is-cif]="active() === 'cif'">
            <div class="route-line" aria-hidden="true">
              <span class="route-fill"></span>
              <span class="route-insurance">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.5 12l2.5 2.5 4.5-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ t('inco.insurance') }}
              </span>
            </div>
            <ol class="route-stops">
              @for (s of stops; track s.id; let i = $index) {
                <li class="stop" [class.is-covered]="i <= reach()">
                  <span class="stop-dot" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path [attr.d]="s.icon" />
                    </svg>
                  </span>
                  <span class="stop-label">{{ t('inco.stops.' + s.id) }}</span>
                </li>
              }
            </ol>
          </div>

          <div class="mt-8 grid gap-6 md:grid-cols-12 md:items-start" aria-live="polite">
            <p class="md:col-span-4">
              <span class="font-display text-4xl font-bold">{{ active().toUpperCase() }}</span>
              <span class="mt-1 block text-sm text-niebla/65">{{
                t('inco.' + active() + '.name')
              }}</span>
            </p>
            <p class="text-lg text-niebla/85 md:col-span-6">
              {{ t('inco.' + active() + '.desc') }}
            </p>
            <ul class="flex flex-col gap-2 text-sm md:col-span-2" aria-hidden="true">
              <li class="flex items-center gap-2">
                <span class="h-1.5 w-5 rounded-full bg-mandarina"></span>{{ t('inco.us') }}
              </li>
              <li class="flex items-center gap-2">
                <span class="h-1.5 w-5 rounded-full bg-niebla/25"></span>{{ t('inco.you') }}
              </li>
            </ul>
          </div>
        </div>

        <dl class="mt-5 grid gap-5 md:grid-cols-3">
          @for (k of items; track k) {
            <div data-reveal class="rounded-3xl border border-palta/15 bg-niebla p-8">
              <dt class="font-display text-2xl font-semibold text-hoja md:text-3xl">
                {{ t('items.' + k + '.q') }}
              </dt>
              <dd class="mt-3 text-lg text-palta/85">{{ t('items.' + k + '.a') }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>
  `,
  styles: `
    .inco-tabs {
      display: inline-flex;
      gap: 0.25rem;
      padding: 0.3rem;
      border-radius: 999px;
      background: rgb(247 248 245 / 0.1);
    }
    .inco-tab {
      min-width: 4.5rem;
      padding: 0.6rem 1.1rem;
      border-radius: 999px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: rgb(247 248 245 / 0.75);
      transition:
        background-color 0.3s,
        color 0.3s;
    }
    .inco-tab:hover {
      color: var(--color-niebla);
    }
    .inco-tab.is-active {
      background: var(--color-mandarina);
      color: var(--color-palta);
    }
    .inco-tab:focus-visible {
      outline: 2px solid var(--color-mandarina);
      outline-offset: 2px;
    }

    /* Recorrido: 4 paradas repartidas; la barra se llena hasta la última que cubrimos */
    .route {
      position: relative;
      margin-top: 3rem;
      --reach: 0.6667;
    }
    .route[data-reach='3'] {
      --reach: 1;
    }
    .route-line {
      position: absolute;
      top: 1.5rem;
      inset-inline: 12.5%;
      height: 4px;
      border-radius: 4px;
      background: rgb(247 248 245 / 0.18);
    }
    .route-fill {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      width: calc(var(--reach) * 100%);
      border-radius: inherit;
      background: var(--color-mandarina);
      transition: width 0.8s cubic-bezier(0.65, 0, 0.35, 1);
    }
    /* Punto de avance al final de lo que cubrimos */
    .route-fill::after {
      content: '';
      position: absolute;
      inset-inline-end: -6px;
      top: -4px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-mandarina);
      box-shadow: 0 0 0 6px rgb(242 163 58 / 0.25);
    }
    /* Seguro marítimo (solo CIF), sobre el tramo del mar */
    .route-insurance {
      position: absolute;
      bottom: 0.9rem;
      inset-inline-start: 83.33%;
      translate: -50% 0;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.7rem;
      border-radius: 999px;
      background: var(--color-arandano);
      color: var(--color-niebla);
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      opacity: 0;
      transform: translateY(6px) scale(0.9);
      transition:
        opacity 0.4s,
        transform 0.4s;
    }
    :host-context([dir='rtl']) .route-insurance {
      translate: 50% 0;
    }
    .is-cif .route-insurance {
      opacity: 1;
      transform: none;
      transition-delay: 0.5s;
    }
    .route-stops {
      position: relative;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }
    .stop {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      text-align: center;
    }
    .stop-dot {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: var(--color-palta);
      border: 2px solid rgb(247 248 245 / 0.25);
      color: rgb(247 248 245 / 0.6);
      transition:
        border-color 0.4s,
        color 0.4s,
        background-color 0.4s;
    }
    .stop.is-covered .stop-dot {
      border-color: var(--color-mandarina);
      color: var(--color-mandarina);
    }
    .stop-label {
      max-width: 11ch;
      font-size: 0.9rem;
      line-height: 1.3;
      color: rgb(247 248 245 / 0.8);
    }
    @media (prefers-reduced-motion: reduce) {
      .route-fill,
      .route-insurance,
      .stop-dot {
        transition: none;
      }
    }
  `,
})
export class ComoTrabajamosComponent {
  protected readonly items = ['volume', 'payment', 'port'] as const;
  protected readonly terms: Term[] = ['fob', 'cfr', 'cif'];
  protected readonly active = signal<Term>('fob');
  protected readonly reach = () => REACH[this.active()];

  /** Paradas del recorrido con su ícono (trazos de 24 × 24). */
  protected readonly stops = [
    // Planta de empaque: nave con techo a dos aguas
    { id: 'plant', icon: 'M3 21V9l9-5 9 5v12M3 21h18M8 21v-6h8v6M8 18h8' },
    // Puerto: ancla
    { id: 'port', icon: 'M12 7a2 2 0 100-4 2 2 0 000 4zM12 7v14M7 11h10M4 14a8 8 0 0016 0' },
    // A bordo: buque con contenedores
    { id: 'board', icon: 'M3 15l2.5 5h13L21 15H3zM6 15V9h5v6M11 15v-4h6v4M12 3v6' },
    // Destino: banderín sobre el puerto de llegada
    { id: 'dest', icon: 'M6 21V4M6 4h11l-2.5 4L17 12H6' },
  ] as const;

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private touched = false;

  protected choose(term: Term): void {
    this.touched = true;
    this.active.set(term);
  }

  constructor() {
    const scroll = inject(SmoothScrollService);
    let timer: ReturnType<typeof setInterval> | undefined;
    let io: IntersectionObserver | undefined;

    afterNextRender(() => {
      if (scroll.reducedMotion()) return;
      // Recorre FOB → CFR → CIF mientras el panel está a la vista y nadie eligió uno
      io = new IntersectionObserver(
        ([entry]) => {
          clearInterval(timer);
          if (!entry.isIntersecting || this.touched) return;
          timer = setInterval(() => {
            if (this.touched) return clearInterval(timer);
            const i = this.terms.indexOf(this.active());
            this.active.set(this.terms[(i + 1) % this.terms.length]);
          }, 3200);
        },
        { threshold: 0.5 },
      );
      io.observe(this.panel().nativeElement);
    });

    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      io?.disconnect();
    });
  }
}
