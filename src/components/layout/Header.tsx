import { useEffect, useState } from 'preact/hooks';
import { BRAND_DESCRIPTOR, BRAND_NAME, LOGO } from '../../config/brand';
import { active } from '../../lib/active-section';
import { useT } from '../../lib/i18n';
import * as scroll from '../../lib/smooth-scroll';
import { openQuote } from '../../lib/ui';
import { LangSwitch } from './LangSwitch';

export const NAV_ITEMS = [
  'origen',
  'nosotros',
  'proceso',
  'productos',
  'datos',
  'como',
  'contacto',
] as const;

/** Menú transparente sobre el hero; fondo sólido al hacer scroll. */
export function Header() {
  const t = useT('nav');
  const tc = useT('common');
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const current = active.value;

  useEffect(() => {
    const update = () => setSolid(window.scrollY > window.innerHeight * 0.75);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Bloquea el scroll de fondo mientras el menú móvil está abierto
  useEffect(() => {
    if (!menuOpen) return;
    scroll.stop();
    return () => scroll.start();
  }, [menuOpen]);

  const go = (event: Event, id: string) => {
    event.preventDefault();
    setMenuOpen(false);
    scroll.scrollTo(`#${id}`);
  };

  const quote = () => {
    setMenuOpen(false);
    openQuote();
  };

  const light = solid || menuOpen;

  return (
    <header
      class={`fixed inset-x-0 top-0 z-50 ${
        menuOpen
          ? 'bg-niebla text-palta'
          : solid
            ? 'bg-niebla/95 text-palta shadow-[0_1px_0_rgb(30_59_47/0.1)] transition-[background-color,color,box-shadow] duration-300'
            : 'bg-transparent text-niebla transition-[background-color,color,box-shadow] duration-300'
      }`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setMenuOpen(false);
      }}
    >
      <a
        href="#contenido"
        class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:rounded-full focus:bg-mandarina focus:px-4 focus:py-2 focus:text-palta"
      >
        {tc('skip')}
      </a>

      <div class="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <a
          href="#inicio"
          class="flex shrink-0 items-center gap-3"
          onClick={(e) => go(e, 'inicio')}
          aria-label={`${BRAND_NAME} — ${t('home')}`}
        >
          {/* Logo: símbolo (ruta en brand.ts) + wordmark. Versión clara/oscura según el fondo */}
          <img
            src={light ? LOGO.light : LOGO.dark}
            alt=""
            width={LOGO.width}
            height={LOGO.height}
            class="h-11 w-auto"
            fetchpriority="high"
            data-brand-symbol
          />
          <span class="flex flex-col gap-[3px] leading-none" data-intro-fade>
            <span class="font-brand text-[1.6rem] leading-none font-semibold tracking-[-0.01em]">
              {BRAND_NAME}
            </span>
            <span
              class={`text-xs font-medium tracking-[0.02em] ${light ? 'text-hoja' : 'text-[#C9D9B8]'}`}
            >
              {BRAND_DESCRIPTOR}
            </span>
          </span>
        </a>

        <nav class="hidden lg:block" aria-label={t('label')} data-intro-fade>
          <ul class="flex items-center gap-5 text-sm font-medium whitespace-nowrap xl:gap-8 xl:text-[0.95rem]">
            {NAV_ITEMS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  class={`nav-link relative py-2 ${current === id ? 'is-active' : ''}`}
                  aria-current={current === id ? 'location' : undefined}
                  onClick={(e) => go(e, id)}
                >
                  {t(id)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div class="flex shrink-0 items-center gap-3" data-intro-fade>
          <LangSwitch />
          <button
            type="button"
            class="btn-primary hidden min-h-11 !px-5 !py-2 text-sm whitespace-nowrap md:inline-flex lg:hidden xl:inline-flex"
            onClick={quote}
          >
            {t('cta')}
          </button>
          <button
            type="button"
            class="grid size-11 place-items-center rounded-full lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          class="mobile-menu h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-palta/10 bg-niebla lg:hidden"
        >
          <nav
            class="container-page flex min-h-full flex-col justify-between gap-8 py-6"
            aria-label={t('label')}
          >
            <ul class="flex flex-col">
              {NAV_ITEMS.map((id) => (
                <li key={id} class="border-b border-palta/10">
                  <a
                    href={`#${id}`}
                    class={`flex items-center justify-between py-3.5 font-display text-2xl font-semibold sm:text-3xl ${current === id ? 'text-hoja' : 'text-palta'}`}
                    aria-current={current === id ? 'location' : undefined}
                    onClick={(e) => go(e, id)}
                  >
                    {t(id)}
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      class="shrink-0 opacity-40 rtl:-scale-x-100"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
            {/* El idioma ya está en la barra superior (visible en todos los tamaños) */}
            <button type="button" class="btn-primary w-full" onClick={quote}>
              {t('cta')}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
