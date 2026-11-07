import './productos.css';
import { useRef, useState } from 'preact/hooks';
import { PRODUCTS, type ProductId } from '../../data/productos.data';
import { asset } from '../../lib/assets';
import { useT } from '../../lib/i18n';
import { openProduct } from '../../lib/ui';
import { PhotoPlaceholder } from '../shared/PhotoPlaceholder';

/**
 * Qué ofrecemos: paneles que se expanden. La fruta activa se ensancha y muestra su información;
 * al hacer clic en ella se abre el detalle (ProductDetail, compartido con el mapa de Origen).
 * En pantallas táctiles el primer toque abre el panel y el segundo, el detalle.
 */
export function Productos() {
  const t = useT('productos');
  /** Panel abierto (por defecto, el primero). */
  const [active, setActive] = useState(0);
  /** true mientras el cursor está sobre los paneles: el clic abre directo el detalle. */
  const hovering = useRef(false);
  /** true entre pointerdown y click: el foco de un toque no debe contar como "ya abierto". */
  const pressing = useRef(false);

  /** Solo el mouse abre al pasar (en táctil el navegador emula eventos de cursor). */
  const hover = (i: number, event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    hovering.current = true;
    setActive(i);
  };

  /** Teclado: al llegar con Tab se abre el panel. */
  const focused = (i: number) => {
    if (!pressing.current) setActive(i);
  };

  /** Clic: si el panel ya está abierto (o se llegó con el cursor), abre el detalle. */
  const choose = (i: number, id: ProductId) => {
    pressing.current = false;
    if (active === i || hovering.current) {
      setActive(i);
      openProduct(id);
    } else {
      setActive(i);
    }
  };

  return (
    <section id="productos" class="productos-section py-24 md:py-36" aria-labelledby="productos-title">
      <div class="container-page">
        <div class="grid gap-6 md:grid-cols-12 md:items-end">
          <h2
            data-reveal
            id="productos-title"
            class="text-4xl leading-[1.05] font-bold md:col-span-7 md:text-6xl"
          >
            {t('heading')}
          </h2>
          <p data-reveal class="measure text-lg text-palta/75 md:col-span-4 md:col-start-9">
            {t('intro')}
          </p>
        </div>

        {/* Paneles que se expanden: la fruta activa (cursor, foco o toque) se ensancha y muestra su
            información; las demás quedan como franjas con su nombre. Clic en la activa: detalle.
            Escritorio: franjas verticales lado a lado. Móvil: filas apiladas (acordeón). */}
        <ul
          data-reveal
          class="panels mt-10 md:mt-14 lg:mt-10"
          onPointerLeave={() => (hovering.current = false)}
        >
          {PRODUCTS.map((p, i) => (
            <li
              key={p.id}
              class={`panel ${active === i ? 'is-active' : ''}`}
              onPointerEnter={(e) => hover(i, e)}
            >
              <button
                type="button"
                class="panel__btn"
                aria-expanded={active === i}
                aria-label={
                  active === i
                    ? t('viewDetail', { name: t('items.' + p.id + '.name') })
                    : t('items.' + p.id + '.name')
                }
                onPointerDown={() => (pressing.current = true)}
                onFocus={() => focused(i)}
                onClick={() => choose(i, p.id)}
              >
                {p.placeholder ? (
                  <PhotoPlaceholder />
                ) : (
                  <img
                    src={asset(p.image)}
                    alt={t('items.' + p.id + '.alt')}
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    class="panel__img absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <span class="panel__shade" aria-hidden="true"></span>

                {/* Franja cerrada: nombre en vertical (escritorio) o en línea (móvil) */}
                <span class="panel__label font-display font-semibold" aria-hidden="true">
                  {t('items.' + p.id + '.name')}
                </span>

                {/* Abierta: nombre, resumen, temporada y "ver detalle" */}
                <span class="panel__info">
                  <span class="panel__num tabular-nums">0{i + 1}</span>
                  <span class="panel__name font-display font-bold">{t('items.' + p.id + '.name')}</span>
                  <span class="panel__summary">{t('items.' + p.id + '.summary')}</span>
                  <span class="panel__meta">
                    <span class="panel__season">
                      {t('season')} · {t('items.' + p.id + '.season')}
                    </span>
                    <span class="panel__more" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          stroke-width="2.2"
                          stroke-linecap="round"
                        />
                      </svg>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
