import { signal, computed } from '@preact/signals';
import es from '../i18n/es.json';
import { AVAILABLE_LANGS, BRAND_NAME, DEFAULT_LANG, LANG_META, type Lang } from '../config/brand';

type Dict = Record<string, unknown>;

const STORAGE_KEY = 'lang';
const loaders = import.meta.glob<{ default: Dict }>('../i18n/*.json');

/** Idioma activo. Empieza en el idioma por defecto para que la hidratación coincida con el HTML estático. */
export const lang = signal<Lang>(DEFAULT_LANG);
const dicts = signal<Partial<Record<Lang, Dict>>>({ [DEFAULT_LANG]: es as Dict });

export const info = computed(() => LANG_META[lang.value] ?? LANG_META[DEFAULT_LANG]);
/** Locale para Intl (formato de números en contadores). */
export const locale = computed(() => info.value.locale);
/** Dirección del texto: 'rtl' para árabe y hebreo. */
export const dir = computed(() => info.value.dir);

function lookup(dict: Dict | undefined, key: string): unknown {
  let cur: unknown = dict;
  for (const part of key.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function interpolate(text: string, params?: Record<string, unknown>): string {
  if (!params) return text;
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k: string) =>
    params[k] == null ? '' : String(params[k]),
  );
}

/** Traduce una clave (con `{{param}}`); si falta en el idioma activo usa el idioma por defecto. */
export function t(key: string, params?: Record<string, unknown>): string {
  const value =
    lookup(dicts.value[lang.value], key) ?? lookup(dicts.value[DEFAULT_LANG], key) ?? key;
  return typeof value === 'string' ? interpolate(value, params) : key;
}

/** Igual que `t` pero para listas (p. ej. los meses). */
export function tList(key: string): string[] {
  const value = lookup(dicts.value[lang.value], key) ?? lookup(dicts.value[DEFAULT_LANG], key);
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Devuelve un traductor con prefijo, equivalente a `*transloco="let t; prefix: 'x'"`. */
export function useT(prefix?: string) {
  // Leer lang/dicts aquí suscribe al componente a los cambios de idioma
  void lang.value;
  void dicts.value;
  return (key: string, params?: Record<string, unknown>) =>
    t(prefix ? `${prefix}.${key}` : key, params);
}

async function load(l: Lang): Promise<void> {
  if (dicts.value[l]) return;
  const loader = loaders[`../i18n/${l}.json`];
  if (!loader) return;
  const mod = await loader();
  dicts.value = { ...dicts.value, [l]: mod.default };
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && AVAILABLE_LANGS.includes(saved)) return saved;
  } catch {
    /* almacenamiento no disponible */
  }
  // Primer idioma del navegador que tengamos disponible
  for (const pref of navigator.languages ?? []) {
    const code = pref.slice(0, 2).toLowerCase() as Lang;
    if (AVAILABLE_LANGS.includes(code)) return code;
  }
  return DEFAULT_LANG;
}

function updateHead(l: Lang): void {
  const meta = LANG_META[l] ?? LANG_META[DEFAULT_LANG];
  const pageTitle = t('seo.title', { brand: BRAND_NAME });
  const description = t('seo.description');
  document.documentElement.lang = l;
  document.documentElement.dir = meta.dir;
  document.title = pageTitle;
  const setMeta = (attr: 'name' | 'property', name: string, content: string) => {
    document.head.querySelector(`meta[${attr}="${name}"]`)?.setAttribute('content', content);
  };
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', pageTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:locale', meta.ogLocale);
  // Los textos cambian de largo (y de dirección): recalcula las animaciones por scroll
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) =>
    requestAnimationFrame(() => ScrollTrigger.refresh()),
  );
}

/** Cambia el idioma en tiempo real (9 idiomas, incluidos RTL) y actualiza título, metas, lang y dir. */
export async function setLang(l: Lang, persist = true): Promise<void> {
  await load(l);
  lang.value = l;
  updateHead(l);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

/** Se llama una vez en el cliente, tras hidratar: aplica el idioma guardado o el del navegador. */
export async function initLang(): Promise<void> {
  const l = initialLang();
  if (l === DEFAULT_LANG) {
    updateHead(l);
    return;
  }
  await setLang(l, false);
}
