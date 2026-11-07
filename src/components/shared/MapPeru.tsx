import './map-peru.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Ref } from 'preact';
import { gsap } from 'gsap';
import { GROWING_ZONES, PORTS } from '../../data/destinos.data';
import { PRODUCTS, type ProductId } from '../../data/productos.data';
import { asset } from '../../lib/assets';
import { dir, useT } from '../../lib/i18n';
import { reducedMotion } from '../../lib/smooth-scroll';
import { openProduct } from '../../lib/ui';
import { FruitIcon } from './FruitIcon';
import { PERU_PATH } from './peru-path';
import { COAST_AREA, JUNGLE_AREA, VB_H, VB_W, VB_X, VB_Y, project, toPercent } from './peru-geo';

/** Colores de las regiones (leyenda; el mapa usa degradados de estos tonos). */
const REGION_COLORS = { costa: '#F3E2AF', sierra: '#C28449', selva: '#679448' } as const;
const REGIONS = ['costa', 'sierra', 'selva'] as const;
const VIEW_BOX = `${VB_X} ${VB_Y} ${VB_W} ${VB_H}`;

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

const zones = GROWING_ZONES.map((z) => {
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

const ports = PORTS.map((p) => {
  const [x, y] = project(p.lon, p.lat);
  return { id: p.id, x, y };
});

/** Estado inicial: mapa vacío, sin frutas. */
export function prepareMapPeru(host: HTMLElement): void {
  const q = gsap.utils.selector(host);
  gsap.set(q('.region'), { opacity: 0 });
  gsap.set(q('.port'), { opacity: 0 });
  gsap.set(q('.zone'), { scale: 0, opacity: 0 });
}

/**
 * En qué fase y en qué punto de esa fase (0–1) aparece la fruta de una región.
 * Sirve para sincronizar el vuelo de cada fruta hacia la cesta.
 */
export function popAt(id: string): { phase: number; at: number } {
  if (id === 'lima') return { phase: 2, at: 0.2 };
  return { phase: 1, at: POP_ORDER.indexOf(id) * 0.24 };
}

/** Marcador (círculo con la fruta) de una región. */
export function markerEl(host: HTMLElement, id: string): HTMLElement {
  return host.querySelector<HTMLElement>(`.zone[data-id="${id}"] .marker`)!;
}

function popZone(host: HTMLElement, id: string, at: number, tl: gsap.core.Timeline): void {
  const q = gsap.utils.selector(host);
  tl.to(
    q(`.zone[data-id="${id}"]`),
    { scale: 1, opacity: 1, duration: 0.15, ease: 'back.out(2)' },
    at,
  );
}

/** Línea de tiempo de una fase (sin scroll propio). */
export function phaseMapPeru(host: HTMLElement, n: number): gsap.core.Timeline {
  const q = gsap.utils.selector(host);
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
      for (const id of POP_ORDER.slice(0, 4)) popZone(host, id, popAt(id).at, tl);
      tl.to({}, { duration: 0.1 }, 0.9);
      break;
    case 2: // Lima
      popZone(host, 'lima', popAt('lima').at, tl);
      tl.to({}, { duration: 0.1 }, 0.9);
      break;
  }
  return tl;
}

/**
 * Mapa del Perú: regiones naturales con relieve, puertos de embarque y un ícono de fruta por
 * región de origen (con pulso y mini tarjeta al pasar el cursor o tocar; cada fruta de la tarjeta abre su detalle).
 * Fases: 0 aparece el país · 1 se marcan las regiones del norte al sur · 2 Lima.
 * Si `managed` es true, la sección padre arma la línea de tiempo; si no, se anima sola.
 */
export function MapPeru({
  managed = false,
  innerRef,
}: {
  managed?: boolean;
  innerRef?: Ref<HTMLElement>;
}) {
  const t = useT('origen');
  const tp = useT('productos');
  const host = useRef<HTMLElement>(null);
  /** Región abierta por toque/clic (en pantallas táctiles no hay hover). */
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || managed || reducedMotion.value) return;
    // Modo independiente (móvil): las fases avanzan mientras el mapa cruza la pantalla
    const ctx = gsap.context(() => {
      prepareMapPeru(el);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 40%', scrub: 0.8 },
      });
      [0, 1, 2].forEach((n) => tl.add(phaseMapPeru(el, n)));
    }, el);
    return () => ctx.revert();
  }, []);

  const setRef = (el: HTMLElement | null) => {
    host.current = el;
    if (typeof innerRef === 'function') innerRef(el);
    else if (innerRef) (innerRef as { current: HTMLElement | null }).current = el;
  };

  /** Cierra la tarjeta cuando el foco sale de la región (no al pasar del marcador a una fruta). */
  const onFocusOut = (event: FocusEvent, id: string) => {
    const zone = event.currentTarget as HTMLElement;
    if (zone.contains(event.relatedTarget as Node | null)) return;
    if (active === id) setActive(null);
  };

  return (
    <figure ref={setRef} class="map-peru map relative mx-auto w-full max-w-[28rem]" dir="ltr">
      {/* Mapa y pines en el mismo contenedor: las posiciones (%) se miden sobre el mapa */}
      <div class="map-box relative">
        <svg
          viewBox={VIEW_BOX}
          class="block h-auto w-full overflow-visible"
          role="img"
          aria-label={t('mapLabel')}
        >
          {/* Mismo lenguaje que la semilla y la mariposa: degradados con luz desde arriba a la
              izquierda y borde interior oscuro. */}
          <defs>
            <clipPath id="mp-peru-clip">
              <path d={PERU_PATH} />
            </clipPath>
            <radialGradient id="mp-g-costa" cx=".3" cy=".25" r=".9">
              <stop offset="0" stop-color="#FBF0CF" />
              <stop offset=".55" stop-color="#EFDCA6" />
              <stop offset="1" stop-color="#D9BD80" />
            </radialGradient>
            <radialGradient id="mp-g-sierra" cx=".3" cy=".25" r=".9">
              <stop offset="0" stop-color="#E9B87C" />
              <stop offset=".4" stop-color="#C98E52" />
              <stop offset=".8" stop-color="#9E6537" />
              <stop offset="1" stop-color="#7E4D29" />
            </radialGradient>
            <radialGradient id="mp-g-selva" cx=".3" cy=".25" r=".9">
              <stop offset="0" stop-color="#A3C978" />
              <stop offset=".4" stop-color="#76A44F" />
              <stop offset=".8" stop-color="#4F7D37" />
              <stop offset="1" stop-color="#3A6228" />
            </radialGradient>
          </defs>

          <g clip-path="url(#mp-peru-clip)">
            {/* Regiones naturales */}
            <path class="region" d={PERU_PATH} fill="url(#mp-g-sierra)" />
            <path class="region" d={COAST_AREA} fill="url(#mp-g-costa)" />
            <path class="region" d={JUNGLE_AREA} fill="url(#mp-g-selva)" />

            {/* Borde interior oscuro (como el de las alas) */}
            <path d={PERU_PATH} fill="none" stroke="#1E3B2F" stroke-opacity="0.9" stroke-width="7" />
          </g>

          {/* Contorno exterior suave */}
          <path
            d={PERU_PATH}
            fill="none"
            stroke="#1E3B2F"
            stroke-opacity="0.5"
            stroke-width="1.2"
            stroke-linejoin="round"
          />

          {/* Puertos de embarque */}
          {ports.map((p) => (
            <g key={p.id} class="port" data-id={p.id} transform={`translate(${p.x} ${p.y})`}>
              <circle r="7" fill="#F7F8F5" stroke="#1E3B2F" stroke-width="1.6" />
              <circle r="2.6" fill="#1E3B2F" />
              <text x="-12" y="4.5" text-anchor="end" class="port-label">
                {t('ports.' + p.id)}
              </text>
            </g>
          ))}
        </svg>

        {/* Regiones de origen: pin con la fruta principal y mini tarjeta con todas sus frutas */}
        <ul class="absolute inset-0">
          {zones.map((z) => (
            <li
              key={z.id}
              data-id={z.id}
              class={`zone absolute ${active === z.id ? 'is-open' : ''}`}
              style={{ left: `${z.x}%`, top: `${z.y}%` }}
              onFocusOut={(e) => onFocusOut(e as FocusEvent, z.id)}
            >
              {/* Caja del marcador (la punta del pin marca la región); la mini tarjeta se posiciona respecto a ella */}
              <div class="anchor relative">
                <button
                  type="button"
                  class="marker group relative block h-full w-full"
                  aria-label={`${t('zonas.' + z.id + '.name')}: ${t('zonas.' + z.id + '.crops')}`}
                  aria-expanded={active === z.id}
                  aria-controls={`zone-card-${z.id}`}
                  onClick={() => setActive(active === z.id ? null : z.id)}
                >
                  <span class="pin" aria-hidden="true">
                    <span class="pin__icon">
                      <FruitIcon fruit={z.fruits[0]} size={28} />
                    </span>
                  </span>
                </button>

                {/* Mini tarjeta: cada fruta abre su detalle (el mismo modal del catálogo) */}
                <div
                  id={`zone-card-${z.id}`}
                  class={`card absolute w-64 overflow-hidden rounded-2xl bg-niebla text-start text-palta shadow-[0_14px_40px_rgb(20_42_32/0.28)] ${z.below ? 'card--below' : ''}`}
                  data-align={z.align}
                  dir={dir.value}
                >
                  <img src={asset(z.image)} alt="" class="h-24 w-full object-cover" loading="lazy" />
                  <div class="px-2 pt-3 pb-2">
                    <strong class="block px-2 font-display text-lg leading-tight">
                      {t('zonas.' + z.id + '.name')}
                    </strong>
                    <ul class="mt-1.5 flex flex-col">
                      {z.fruits.map((f: ProductId) => (
                        <li key={f}>
                          <button
                            type="button"
                            class="fruit-link flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm"
                            onClick={() => openProduct(f)}
                          >
                            <FruitIcon fruit={f} size={18} />
                            <span class="font-semibold whitespace-nowrap">
                              {tp('items.' + f + '.name')}
                            </span>
                            <span class="ms-auto text-end text-xs text-palta/65">
                              {tp('items.' + f + '.season')}
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                              aria-hidden="true"
                              class="fruit-link__arrow shrink-0"
                            >
                              <path
                                d="M9 6l6 6-6 6"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Leyenda */}
      <figcaption
        class="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-palta/80"
        dir={dir.value}
      >
        {REGIONS.map((r) => (
          <span key={r} class="inline-flex items-center gap-2">
            <span
              class="size-3.5 rounded-full ring-1 ring-palta/30"
              style={{ background: REGION_COLORS[r] }}
            ></span>
            {t('regions.' + r)}
          </span>
        ))}
        <span class="inline-flex items-center gap-2">
          <svg width="14" height="14" viewBox="-8 -8 16 16" aria-hidden="true">
            <circle r="6" fill="#F7F8F5" stroke="#1E3B2F" stroke-width="1.6" />
            <circle r="2.4" fill="#1E3B2F" />
          </svg>
          {t('legendPort')}
        </span>
      </figcaption>
    </figure>
  );
}
