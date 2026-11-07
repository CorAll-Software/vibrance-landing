import {
  BRAND_DESCRIPTOR,
  BRAND_NAME,
  CONTACT,
  LEGAL_NAME,
  LOGO,
  POWERED_BY,
  RUC,
  SHOW_SOCIALS,
} from '../../config/brand';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useT } from '../../lib/i18n';
import { openPrivacy } from '../../lib/ui';
import { LangSwitch } from './LangSwitch';
import { WhatsappIcon, useWhatsappHref } from './WhatsappButton';

const YEAR = new Date().getFullYear();

/**
 * Firma de CorAll, la empresa que desarrolló la web: discreta, al pie y con su logo en blanco.
 * Si el logo no carga (p. ej. aún no está en el bucket), se muestra el nombre en texto.
 */
function PoweredBy({ label }: { label: string }) {
  const img = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // El error pudo ocurrir antes de hidratar (y entonces onError ya no llega): se revisa al montar
  useEffect(() => {
    const el = img.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  const content = (
    <>
      <span>{label}</span>
      {failed ? (
        <span class="font-semibold text-niebla/80 transition-colors duration-200 group-hover:text-niebla">
          {POWERED_BY.name}
        </span>
      ) : (
        <img
          ref={img}
          src={POWERED_BY.logo}
          alt={POWERED_BY.name}
          width={POWERED_BY.width}
          height={POWERED_BY.height}
          class="h-[18px] w-auto opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
  const cls = 'group flex w-fit items-center gap-2';
  return POWERED_BY.href ? (
    <a href={POWERED_BY.href} target="_blank" rel="noopener" class={`${cls} hover:text-niebla`}>
      {content}
    </a>
  ) : (
    <p class={cls}>{content}</p>
  );
}

export function Footer() {
  const t = useT('footer');
  const c = useT('common');
  const href = useWhatsappHref();

  return (
    <footer class="bg-palta-deep text-niebla">
      <div class="container-page grid gap-12 py-16 md:grid-cols-12">
        <div class="md:col-span-5">
          <div class="flex items-center gap-3">
            <img
              src={LOGO.dark}
              alt=""
              width={LOGO.width}
              height={LOGO.height}
              class="h-12 w-auto"
              loading="lazy"
            />
            <div class="flex flex-col gap-[3px] leading-none">
              <p class="font-brand text-[1.75rem] leading-none font-semibold">{BRAND_NAME}</p>
              <p class="text-sm font-medium text-[#C9D9B8]">{BRAND_DESCRIPTOR}</p>
            </div>
          </div>
          <p class="mt-3 max-w-[36ch] text-niebla/75">{t('tagline')}</p>
        </div>

        <div class="md:col-span-3">
          <h2 class="font-sans text-base font-semibold">{t('contact')}</h2>
          <address class="mt-3 flex flex-col gap-1.5 not-italic text-niebla/75">
            <span>
              {c('buyers')}:{' '}
              <a href={`mailto:${CONTACT.email}`} class="hover:text-niebla hover:underline">
                <bdi dir="ltr">{CONTACT.email}</bdi>
              </a>
              <br />
              {c('partners')}:{' '}
              <a href={`mailto:${CONTACT.partnersEmail}`} class="hover:text-niebla hover:underline">
                <bdi dir="ltr">{CONTACT.partnersEmail}</bdi>
              </a>
            </span>
            <span>{CONTACT.address}</span>
          </address>
        </div>

        <div class="flex flex-col gap-6 md:col-span-4">
          {SHOW_SOCIALS && (
            <div>
              <h2 class="font-sans text-base font-semibold">{t('follow')}</h2>
              <ul class="mt-3 flex gap-2">
                {CONTACT.socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.href}
                      class="grid size-11 place-items-center rounded-full border border-niebla/25 transition-colors hover:bg-niebla hover:text-palta"
                      aria-label={s.label}
                    >
                      {s.id === 'linkedin' && (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                          <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21H9z" />
                        </svg>
                      )}
                      {s.id === 'instagram' && (
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          aria-hidden="true"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 class="font-sans text-base font-semibold">{t('language')}</h2>
            <LangSwitch class="mt-3" dropUp />
          </div>
          {/* Sin números escritos: solo el botón de WhatsApp */}
          <a
            href={href}
            target="_blank"
            rel="noopener"
            aria-label={c('whatsapp')}
            class="grid size-11 place-items-center rounded-full border border-niebla/25 text-niebla transition-colors hover:bg-niebla hover:text-palta"
          >
            <WhatsappIcon class="size-6" />
          </a>
        </div>
      </div>

      <div class="border-t border-niebla/10">
        {/* Espacio para el botón flotante de WhatsApp: abajo en celular y al final (margen del
            contenedor + el botón) desde sm, para que no tape el "powered by" al llegar al pie */}
        <div class="container-page flex flex-col gap-3 pt-6 pb-20 text-sm text-niebla/60 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pb-6 sm:pe-[calc(clamp(1.25rem,5vw,4rem)+4rem)] md:pe-[calc(clamp(1.25rem,5vw,4rem)+5.5rem)]">
          <p>
            © {YEAR} <bdi>{LEGAL_NAME}</bdi> ·{' '}
            <bdi dir="ltr" class="whitespace-nowrap">
              RUC {RUC}
            </bdi>{' '}
            · {t('rights')}
          </p>
          <div class="flex flex-col gap-3 sm:shrink-0 sm:flex-row sm:items-center sm:gap-6">
            <button
              type="button"
              class="w-fit hover:text-niebla hover:underline"
              onClick={openPrivacy}
            >
              {t('privacy')}
            </button>
            <PoweredBy label={t('poweredBy')} />
          </div>
        </div>
      </div>
    </footer>
  );
}
