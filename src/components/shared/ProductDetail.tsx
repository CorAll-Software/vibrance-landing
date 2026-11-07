import './product-detail.css';
import { useRef } from 'preact/hooks';
import { PRODUCTS, type Product, type ProductId } from '../../data/productos.data';
import { MARKET_ACCESS } from '../../data/mercados.data';
import { asset } from '../../lib/assets';
import { t as translate, useT } from '../../lib/i18n';
import { closeProduct, openQuote, productDetail } from '../../lib/ui';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { Modal } from './Modal';
import { PhotoPlaceholder } from './PhotoPlaceholder';

/** Mercados con protocolo vigente para el producto, ya traducidos. */
const marketNames = (id: ProductId): string =>
  MARKET_ACCESS[id].map((m) => translate('datos.destinos.' + m)).join(', ');

/**
 * Modal de detalle de un producto (variedades, calibres, mercados, calendario y cotización).
 * Uno solo para toda la página: lo abren las tarjetas del catálogo y las frutas del mapa de
 * Origen con `openProduct(id)`.
 *
 * Responsive: en móvil la foto va arriba (banda baja) y el contenido debajo; desde `lg` la foto
 * queda a la izquierda, fija mientras se recorre el contenido a la derecha.
 */
export function ProductDetail() {
  const t = useT('productos');
  const id = productDetail.value;
  // Se conserva el último producto para que el contenido no desaparezca al cerrar
  const last = useRef<Product | null>(null);
  if (id) last.current = PRODUCTS.find((p) => p.id === id)!;
  const p = last.current;

  const quote = (product: Product) => {
    closeProduct();
    // Espera a que el modal de detalle se cierre antes de abrir la cotización
    setTimeout(() => openQuote(product.id), 50);
  };

  return (
    <Modal open={!!id} size="wide" labelledBy="product-title" onClose={closeProduct}>
      {p && (
        <div class="detail">
          <div class="detail__media bg-arena">
            {p.placeholder ? (
              <PhotoPlaceholder />
            ) : (
              <img
                src={asset(p.image)}
                alt={t('items.' + p.id + '.alt')}
                sizes="(min-width: 1024px) 32rem, 100vw"
                class="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          <div class="detail__body">
            <h2 id="product-title" class="detail__title pe-12 text-3xl font-bold sm:text-4xl">
              {t('items.' + p.id + '.name')}
            </h2>
            <p class="detail__summary mt-2 text-base text-palta/75 sm:text-lg">
              {t('items.' + p.id + '.summary')}
            </p>

            <dl class="detail__facts mt-6 grid gap-x-8 gap-y-4 sm:mt-8 sm:grid-cols-2 sm:gap-y-5">
              <div>
                <dt class="text-sm font-semibold text-palta/60">{t('varieties')}</dt>
                <dd class="mt-1">{t('items.' + p.id + '.varieties')}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-palta/60">{t('sizes')}</dt>
                <dd class="mt-1">{p.sizes.join(' · ')}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-palta/60">{t('presentations')}</dt>
                <dd class="mt-1">{t('items.' + p.id + '.presentations')}</dd>
              </div>
              <div>
                <dt class="text-sm font-semibold text-palta/60">{t('packaging')}</dt>
                <dd class="mt-1">{t('items.' + p.id + '.packaging')}</dd>
              </div>
            </dl>
            <p class="detail__note mt-5 text-sm text-palta/70">{t('quoteNote')}</p>

            <div class="detail__block mt-6 border-t border-palta/15 pt-5 sm:mt-8 sm:pt-6">
              <h3 class="font-sans text-sm font-semibold text-palta/60">{t('markets')}</h3>
              <p class="mt-1">{marketNames(p.id)}</p>
              <p class="mt-1 text-sm text-palta/60">{t('marketsNote')}</p>
            </div>

            <div class="detail__block mt-6 border-t border-palta/15 pt-5 sm:mt-8 sm:pt-6">
              <h3 class="font-sans text-sm font-semibold text-palta/60">
                {t('availability')} · {t('items.' + p.id + '.season')}
              </h3>
              <div class="mt-4">
                <AvailabilityCalendar months={p.months} />
              </div>
            </div>

            <button
              type="button"
              class="detail__cta btn-primary mt-8 w-full sm:mt-10 sm:w-auto"
              onClick={() => quote(p)}
            >
              {t('quoteThis', { name: t('items.' + p.id + '.name') })}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
