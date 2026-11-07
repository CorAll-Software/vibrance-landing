import { useEffect, useRef } from 'preact/hooks';
import type { Ref } from 'preact';
import { gsap } from 'gsap';
import { DESTINATIONS, ORIGIN, type GeoPoint } from '../../data/destinos.data';
import { productsForMarket } from '../../data/mercados.data';
import { useT } from '../../lib/i18n';
import { reducedMotion } from '../../lib/smooth-scroll';

// Debe coincidir con public/svg/world-dots.svg (equirectangular, lat 84 → -58)
const VB_W = 1000;
const VB_H = 394;
const LAT_TOP = 84;
const LAT_BOTTOM = -58;

const project = (p: GeoPoint) => ({
  x: ((p.lon + 180) / 360) * VB_W,
  y: ((LAT_TOP - p.lat) / (LAT_TOP - LAT_BOTTOM)) * VB_H,
});

const origin = project(ORIGIN);
const markers = DESTINATIONS.map((d) => {
  const p = project(d);
  return {
    id: d.id,
    left: (p.x / VB_W) * 100,
    top: (p.y / VB_H) * 100,
    products: productsForMarket(d.id).length,
  };
});
/** Curvas cuadráticas desde Perú a cada destino. */
const routes = DESTINATIONS.map((d) => {
  const a = origin;
  const b = project(d);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.22;
  return { id: d.id, d: `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}` };
});

/** Estado inicial: sin rutas ni destinos. */
export function prepareMap(host: HTMLElement): void {
  gsap.set(host.querySelectorAll('.route'), { strokeDasharray: '0 1' });
  gsap.set(host.querySelectorAll('.marker'), { scale: 0, opacity: 0 });
}

/** Las rutas se dibujan desde el Perú y luego aparecen los destinos. */
export function phaseMap(host: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline()
    .to(host.querySelectorAll('.route'), {
      strokeDasharray: '1 0',
      duration: 1.2,
      ease: 'power2.inOut',
      stagger: 0.06,
    })
    .to(
      host.querySelectorAll('.marker'),
      { scale: 1, opacity: 1, duration: 0.35, stagger: 0.05 },
      '-=0.6',
    );
}

/** Mapa mundial de puntos con los mercados (y cuántos productos tienen acceso) y rutas desde el Perú. */
export function MapWorld({
  managed = false,
  innerRef,
}: {
  /** true: la sección padre controla la animación (escena de Origen). */
  managed?: boolean;
  innerRef?: Ref<HTMLElement>;
}) {
  const t = useT('datos');
  const host = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || managed || reducedMotion.value) return;
    let observer: IntersectionObserver | undefined;
    const ctx = gsap.context(() => {
      prepareMap(el);
      // IntersectionObserver en vez de ScrollTrigger: no depende de posiciones calculadas
      // antes de que las secciones fijas de arriba terminen de medirse (disparaba demasiado pronto)
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          phaseMap(el);
        },
        { rootMargin: '0px 0px -25% 0px' },
      );
      observer.observe(el);
    }, el);
    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, []);

  const setRef = (el: HTMLElement | null) => {
    host.current = el;
    if (typeof innerRef === 'function') innerRef(el);
    else if (innerRef) (innerRef as { current: HTMLElement | null }).current = el;
  };

  return (
    // overflow-x-clip: los tooltips (aunque estén ocultos) no deben ensanchar la página en móvil
    <figure ref={setRef} class="relative w-full overflow-x-clip">
      <img
        src="/svg/world-dots.svg"
        alt=""
        width="1000"
        height="394"
        class="block h-auto w-full"
        loading="lazy"
      />
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        class="absolute inset-0 h-full w-full overflow-visible"
        role="img"
        aria-label={t('mapLabel')}
      >
        {routes.map((r) => (
          <path
            key={r.id}
            class="route"
            d={r.d}
            fill="none"
            stroke="#F2A33A"
            stroke-opacity="0.8"
            stroke-width="1.4"
            stroke-dasharray="1 0"
            pathLength="1"
          />
        ))}
        <circle cx={origin.x} cy={origin.y} r="6" fill="#4F7A3A" />
        <circle cx={origin.x} cy={origin.y} r="12" fill="#4F7A3A" fill-opacity="0.25" />
      </svg>
      <ul class="absolute inset-0">
        {markers.map((d) => (
          <li key={d.id} class="marker absolute" style={{ left: `${d.left}%`, top: `${d.top}%` }}>
            <button
              type="button"
              class="group relative grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
              aria-label={`${t('destinos.' + d.id)}: ${t('marketProducts', { n: d.products })}`}
            >
              <span class="size-3 rounded-full bg-mandarina ring-4 ring-mandarina/25 transition-transform duration-200 group-hover:scale-150"></span>
              {/* Cerca de los bordes el tooltip se abre hacia adentro para no salirse de la pantalla */}
              <span
                role="tooltip"
                class={`pointer-events-none absolute bottom-full w-max translate-y-1 rounded-md bg-palta px-2.5 py-1 text-sm font-medium text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 ${
                  d.left > 70 ? 'right-0' : d.left < 30 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                }`}
              >
                <strong class="block font-semibold">{t('destinos.' + d.id)}</strong>
                <span class="text-xs text-white/85">{t('marketProducts', { n: d.products })}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </figure>
  );
}
