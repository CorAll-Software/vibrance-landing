import './como-trabajamos.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useT } from '../../lib/i18n';
import { reducedMotion } from '../../lib/smooth-scroll';

type Term = 'fob' | 'cfr' | 'cif';

/** Hasta qué parada del recorrido llega lo que cubre Vibrance (0 planta … 3 destino). */
const REACH: Record<Term, number> = { fob: 2, cfr: 3, cif: 3 };

const ITEMS = ['volume', 'payment', 'port'] as const;
const TERMS: Term[] = ['fob', 'cfr', 'cif'];

/** Paradas del recorrido con su ícono (trazos de 24 × 24). */
const STOPS = [
  // Planta de empaque: nave con techo a dos aguas
  { id: 'plant', icon: 'M3 21V9l9-5 9 5v12M3 21h18M8 21v-6h8v6M8 18h8' },
  // Puerto: ancla
  { id: 'port', icon: 'M12 7a2 2 0 100-4 2 2 0 000 4zM12 7v14M7 11h10M4 14a8 8 0 0016 0' },
  // A bordo: buque con contenedores
  { id: 'board', icon: 'M3 15l2.5 5h13L21 15H3zM6 15V9h5v6M11 15v-4h6v4M12 3v6' },
  // Destino: banderín sobre el puerto de llegada
  { id: 'dest', icon: 'M6 21V4M6 4h11l-2.5 4L17 12H6' },
] as const;

/**
 * Cómo trabajamos / preguntas frecuentes: Incoterms, volumen mínimo, pagos y puerto.
 * Los Incoterms se explican con un recorrido Planta → Callao → a bordo → destino: al elegir
 * FOB, CFR o CIF se ilumina el tramo que cubre Vibrance (y el seguro marítimo en CIF).
 * Al llegar a la vista recorre solo los tres; si el usuario elige uno, se detiene.
 */
export function ComoTrabajamos() {
  const t = useT('como');
  const [active, setActive] = useState<Term>('fob');
  const panel = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const activeRef = useRef<Term>('fob');
  const reach = REACH[active];

  const choose = (term: Term) => {
    touched.current = true;
    activeRef.current = term;
    setActive(term);
  };

  useEffect(() => {
    if (reducedMotion.value || !panel.current) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    // Recorre FOB → CFR → CIF mientras el panel está a la vista y nadie eligió uno
    const io = new IntersectionObserver(
      ([entry]) => {
        clearInterval(timer);
        if (!entry.isIntersecting || touched.current) return;
        timer = setInterval(() => {
          if (touched.current) return clearInterval(timer);
          const i = TERMS.indexOf(activeRef.current);
          const next = TERMS[(i + 1) % TERMS.length];
          activeRef.current = next;
          setActive(next);
        }, 3200);
      },
      { threshold: 0.5 },
    );
    io.observe(panel.current);
    return () => {
      clearInterval(timer);
      io.disconnect();
    };
  }, []);

  return (
    <section id="como" class="como-section bg-niebla py-24 md:py-36" aria-labelledby="como-title">
      <div class="container-page">
        <div class="grid gap-6 md:grid-cols-12 md:items-end">
          <h2
            data-reveal
            id="como-title"
            class="text-4xl leading-[1.05] font-bold md:col-span-6 md:text-6xl"
          >
            {t('heading')}
          </h2>
          <p data-reveal class="measure text-lg text-palta/75 md:col-span-5 md:col-start-8">
            {t('intro')}
          </p>
        </div>

        {/* Incoterms: qué tramo del recorrido cubre Vibrance */}
        <div ref={panel} data-reveal class="inco mt-14 rounded-3xl bg-palta p-7 text-niebla md:p-12">
          <div class="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h3 class="font-display text-2xl font-semibold md:text-3xl">{t('items.incoterms.q')}</h3>
              <p class="mt-2 text-niebla/75">{t('inco.hint')}</p>
            </div>
            <div class="inco-tabs" role="tablist" aria-label={t('items.incoterms.q')}>
              {TERMS.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  class={`inco-tab ${active === k ? 'is-active' : ''}`}
                  aria-selected={active === k}
                  onClick={() => choose(k)}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Recorrido */}
          <div class={`route ${active === 'cif' ? 'is-cif' : ''}`} data-reach={reach}>
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
                {t('inco.insurance')}
              </span>
            </div>
            <ol class="route-stops">
              {STOPS.map((s, i) => (
                <li key={s.id} class={`stop ${i <= reach ? 'is-covered' : ''}`}>
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
                      <path d={s.icon} />
                    </svg>
                  </span>
                  <span class="stop-label">{t('inco.stops.' + s.id)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div class="mt-8 grid gap-6 md:grid-cols-12 md:items-start" aria-live="polite">
            <p class="md:col-span-4">
              <span class="font-display text-4xl font-bold">{active.toUpperCase()}</span>
              <span class="mt-1 block text-sm text-niebla/65">{t('inco.' + active + '.name')}</span>
            </p>
            <p class="text-lg text-niebla/85 md:col-span-6">{t('inco.' + active + '.desc')}</p>
            <ul class="flex flex-col gap-2 text-sm md:col-span-2" aria-hidden="true">
              <li class="flex items-center gap-2">
                <span class="h-1.5 w-5 rounded-full bg-mandarina"></span>
                {t('inco.us')}
              </li>
              <li class="flex items-center gap-2">
                <span class="h-1.5 w-5 rounded-full bg-niebla/25"></span>
                {t('inco.you')}
              </li>
            </ul>
          </div>
        </div>

        <dl class="mt-5 grid gap-5 md:grid-cols-3">
          {ITEMS.map((k) => (
            <div key={k} data-reveal class="rounded-3xl border border-palta/15 bg-niebla p-8">
              <dt class="font-display text-2xl font-semibold text-hoja md:text-3xl">
                {t('items.' + k + '.q')}
              </dt>
              <dd class="mt-3 text-lg text-palta/85">{t('items.' + k + '.a')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
