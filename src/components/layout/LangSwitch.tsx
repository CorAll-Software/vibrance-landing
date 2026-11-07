import './lang-switch.css';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AVAILABLE_LANGS, LANG_META, type Lang } from '../../config/brand';
import { lang, setLang, useT } from '../../lib/i18n';

/**
 * Selector de idioma desplegable (9 idiomas, cambio en tiempo real sin recargar).
 * Accesible: Esc cierra, flechas arriba/abajo recorren la lista, clic fuera cierra,
 * el foco vuelve al botón al elegir.
 */
export function LangSwitch({ dropUp = false, class: cls = '' }: { dropUp?: boolean; class?: string }) {
  const t = useT('footer');
  const [open, setOpen] = useState(false);
  const host = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const current = lang.value;

  const options = () =>
    Array.from(host.current?.querySelectorAll<HTMLButtonElement>('[role="option"] button') ?? []);

  const close = (returnFocus = false) => {
    if (!open) return;
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!host.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const move = (event: Event, step: number) => {
    event.preventDefault();
    const items = options();
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + step + items.length) % items.length]?.focus();
  };

  const choose = (l: Lang) => {
    void setLang(l);
    close(true);
  };

  return (
    <span
      ref={host}
      class={`relative inline-block ${cls}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') close(true);
      }}
    >
      <button
        ref={trigger}
        type="button"
        class="flex min-h-10 items-center gap-1.5 rounded-full border border-current/30 px-3 text-sm font-semibold transition-colors duration-200 hover:bg-current/10"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t('language')}: ${LANG_META[current].label}`}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setTimeout(() => options()[0]?.focus());
          }
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z" />
        </svg>
        <span>{LANG_META[current].short}</span>
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          class={`transition-transform duration-200 ${open !== dropUp ? 'rotate-180' : ''}`}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language')}
          class={`lang-menu absolute z-50 min-w-44 overflow-hidden rounded-2xl border border-palta/10 bg-white p-1.5 text-palta shadow-xl ${dropUp ? 'bottom-full mb-2 start-0' : 'top-full mt-2 end-0'}`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') move(e, 1);
            else if (e.key === 'ArrowUp') move(e, -1);
          }}
        >
          {AVAILABLE_LANGS.map((l) => (
            <li key={l} role="option" aria-selected={current === l}>
              <button
                type="button"
                class={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-start text-sm transition-colors hover:bg-palta/5 focus-visible:bg-palta/5 ${current === l ? 'font-semibold' : ''}`}
                lang={l}
                dir={LANG_META[l].dir}
                onClick={() => choose(l)}
              >
                <span>{LANG_META[l].label}</span>
                <span class="text-xs text-palta/50" dir="ltr">
                  {LANG_META[l].short}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}
