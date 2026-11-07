import './datos.css';
import { CERTIFICATIONS, STATS } from '../../data/cifras.data';
import { dir, useT } from '../../lib/i18n';
import { AccessTable } from '../shared/AccessTable';
import { Counter } from '../shared/Counter';
import { MapWorld } from '../shared/MapWorld';

/** Datos: cifras de la oferta, mapa de mercados, tabla de acceso por producto y certificaciones. */
export function Datos() {
  const t = useT('datos');
  return (
    <section id="datos" class="datos-section bg-white py-24 md:py-36" aria-labelledby="datos-title">
      <div class="container-page">
        <div class="grid gap-6 md:grid-cols-12 md:items-end">
          <h2
            data-reveal
            id="datos-title"
            class="text-4xl leading-[1.05] font-bold md:col-span-6 md:text-6xl"
          >
            {t('heading')}
          </h2>
          <p data-reveal class="measure text-lg text-palta/75 md:col-span-5 md:col-start-8">
            {t('intro')}
          </p>
        </div>

        {/* Cifras grandes */}
        <dl data-reveal class="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
          {STATS.map((s) => (
            <div key={s.id} class="flex flex-col-reverse justify-end border-t-2 border-mandarina pt-5">
              <dt class="mt-2 text-base text-palta/75">{t('stats.' + s.id + '.label')}</dt>
              <dd class="font-display text-[clamp(2.5rem,4vw,4.25rem)] leading-none font-bold tracking-[0.01em] text-hoja">
                <Counter value={s.value} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
              </dd>
            </div>
          ))}
        </dl>

        {/* Mapa mundial */}
        <div data-reveal class="mt-28 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div class="lg:col-span-4">
            <h3 class="text-2xl font-semibold md:text-4xl">{t('mapTitle')}</h3>
            <p class="mt-4 text-lg text-palta/75">{t('mapText')}</p>
          </div>
          <div class="-mx-4 lg:col-span-8 lg:mx-0">
            <MapWorld />
          </div>
        </div>

        {/* Acceso por producto: responde a la duda principal del importador (¿puede entrar a mi país?) */}
        <div data-reveal class="mt-20">
          <div class="grid gap-4 md:grid-cols-12 md:items-end">
            <h3 class="text-2xl font-semibold md:col-span-6 md:text-4xl">{t('accessTitle')}</h3>
            <p class="text-palta/75 md:col-span-5 md:col-start-8">{t('accessText')}</p>
          </div>
          <div class="mt-8">
            <AccessTable />
          </div>
        </div>
      </div>

      {/* Certificaciones: texto + fila en movimiento. Todas con el mismo formato y sin logos
          (los de BRCGS, SENASA, FDA y ETI no se pueden usar; así ninguna resalta sobre otra) */}
      <div data-reveal class="mt-24">
        <div class="container-page grid gap-4 md:grid-cols-12 md:items-end">
          <h3 class="text-2xl font-semibold md:col-span-5 md:text-4xl">{t('certTitle')}</h3>
          <p class="text-palta/75 md:col-span-6 md:col-start-7">{t('certText')}</p>
        </div>
        <div
          class="marquee mt-10 overflow-hidden"
          dir="ltr"
          tabIndex={0}
          aria-label={t('certTitle')}
          role="region"
        >
          <ul class="marquee__track flex w-max gap-4">
            {[0, 1].map((copy) =>
              CERTIFICATIONS.map((c) => (
                <li
                  key={`${copy}-${c.id}`}
                  class={`flex h-28 w-64 shrink-0 items-center gap-4 rounded-2xl border border-palta/15 bg-niebla px-6 ${copy === 1 ? 'marquee__dup' : ''}`}
                  aria-hidden={copy === 1 ? 'true' : undefined}
                  dir={dir.value}
                >
                  <div class="min-w-0">
                    <p class="font-display text-xl leading-tight font-bold text-palta md:text-2xl">
                      {t('certs.' + c.id + '.name')}
                    </p>
                    <p class="mt-1 text-sm leading-snug text-palta/65">{t('certs.' + c.id + '.desc')}</p>
                  </div>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
