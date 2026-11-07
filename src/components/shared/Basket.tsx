import './basket.css';
import { useEffect, useRef } from 'preact/hooks';
import type { Ref } from 'preact';
import { gsap } from 'gsap';
import type { ProductId } from '../../data/productos.data';
import { reducedMotion } from '../../lib/smooth-scroll';
import { BASKET, BRAID, FRUIT_SIZE, SLOTS, STAKES, WEAVE } from './basket-art';
import { FruitIcon } from './FruitIcon';

const fruitSize = `${FRUIT_SIZE}%`;
const fruits = SLOTS.map((s) => ({ ...s, left: s.x / 2, top: s.y / 2 }));

/** Estado inicial de la escena fija: cesta vacía. */
export function prepareBasket(host: HTMLElement): void {
  gsap.set(host.querySelectorAll('.basket-fruit'), { autoAlpha: 0 });
}

/** Fruta dentro de la cesta (destino del vuelo). */
export function basketFruitEl(host: HTMLElement, id: ProductId): HTMLElement {
  return host.querySelector<HTMLElement>(`.basket-fruit[data-id="${id}"]`)!;
}

/**
 * Cesta de mimbre Vibrance con lugar para las 6 frutas.
 * - `managed`: la sección padre decide cuándo aparece cada fruta (llega volando del mapa).
 * - Si no: las frutas caen solas en la cesta con el scroll (móvil).
 * Con "reducir movimiento", la cesta se muestra llena.
 */
export function Basket({
  managed = false,
  innerRef,
  class: cls = '',
}: {
  managed?: boolean;
  innerRef?: Ref<HTMLElement>;
  class?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || managed || reducedMotion.value) return;
    const ctx = gsap.context(() => {
      // Móvil: las frutas caen una por una mientras la cesta cruza la pantalla
      gsap.fromTo(
        '.basket-fruit',
        { autoAlpha: 0, y: -140 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'bounce.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'bottom 55%',
            scrub: 0.8,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [managed]);

  const setRef = (el: HTMLDivElement | null) => {
    host.current = el;
    if (typeof innerRef === 'function') innerRef(el);
    else if (innerRef) (innerRef as { current: HTMLElement | null }).current = el;
  };

  return (
    <div ref={setRef} class={`basket ${cls}`} aria-hidden="true">
      {/* Atrás: interior oscuro y borde trasero (quedan detrás de la fruta) */}
      <svg viewBox="0 0 200 200" class="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="bk-inside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#2E1C0C" />
            <stop offset="1" stop-color="#5A3A1C" />
          </linearGradient>
          <linearGradient id="bk-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#D8A866" />
            <stop offset="1" stop-color="#8A5A2E" />
          </linearGradient>
        </defs>
        <ellipse cx={BASKET.cx} cy={BASKET.rim} rx={BASKET.rx} ry="21" fill="url(#bk-inside)" />
        <path
          d={BASKET.backRim}
          fill="none"
          stroke="url(#bk-rim)"
          stroke-width="10"
          stroke-linecap="round"
        />
      </svg>

      {/* Frutas */}
      {fruits.map((f) => (
        <span
          key={f.id}
          class="basket-fruit absolute"
          data-id={f.id}
          style={{ left: `${f.left}%`, top: `${f.top}%`, '--fruit-size': fruitSize }}
        >
          <FruitIcon fruit={f.id} size={54} class="block h-full w-full" />
        </span>
      ))}

      {/* Adelante: cuerpo tejido, borde trenzado y etiqueta */}
      <svg
        viewBox="0 0 200 200"
        class="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <linearGradient id="bk-wicker" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#D7A363" />
            <stop offset="0.6" stop-color="#B8814A" />
            <stop offset="1" stop-color="#8A5A2E" />
          </linearGradient>
          <linearGradient id="bk-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#3A2410" stop-opacity="0.55" />
            <stop offset="0.28" stop-color="#3A2410" stop-opacity="0" />
            <stop offset="0.7" stop-color="#3A2410" stop-opacity="0" />
            <stop offset="1" stop-color="#3A2410" stop-opacity="0.6" />
          </linearGradient>
          <linearGradient id="bk-strand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#E6B977" />
            <stop offset="1" stop-color="#A9733E" />
          </linearGradient>
          <clipPath id="bk-clip">
            <path d={BASKET.body} />
          </clipPath>
        </defs>
        <path d={BASKET.body} fill="url(#bk-wicker)" />
        <g clip-path="url(#bk-clip)">
          <g stroke="#6E4520" stroke-width="2.8" stroke-linecap="round" opacity="0.8">
            {STAKES.map((s, i) => (
              <path key={i} d={s} />
            ))}
          </g>
          {WEAVE.map((w, i) => (
            <rect
              key={i}
              x={w.x - w.w / 2}
              y={w.y - 3.2}
              width={w.w}
              height="6.4"
              rx="3.2"
              fill="url(#bk-strand)"
              stroke="#7A4E26"
              stroke-width="0.7"
              transform={`rotate(${w.rot} ${w.x} ${w.y})`}
            />
          ))}
          <path d={BASKET.body} fill="url(#bk-side)" />
        </g>
        <path
          d={BASKET.frontRim}
          fill="none"
          stroke="url(#bk-rim)"
          stroke-width="11"
          stroke-linecap="round"
        />
        <g stroke="#7A4E26" stroke-width="1.6" stroke-linecap="round" opacity="0.8">
          {BRAID.map((b, i) => (
            <path key={i} d={b} />
          ))}
        </g>
        <rect
          x="58"
          y="146"
          width="84"
          height="26"
          rx="5"
          fill="#F5EBD6"
          stroke="#C9A574"
          stroke-width="1.2"
        />
        <text x="100" y="164.5" text-anchor="middle" class="label">
          Vibrance
        </text>
      </svg>
    </div>
  );
}
