import { signal, computed } from '@preact/signals';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import es from '../i18n/es.json';
import { AVAILABLE_LANGS, BRAND_NAME, DEFAULT_LANG, LANG_META, type Lang } from '../config/brand';
import { langPath } from './routes';

export type Dict = Record<string, unknown>;

const STORAGE_KEY = 'lang';
const loaders = import.meta.glob<{ default: Dict }>(['../i18n/*.json', '!../i18n/es.json']);

/** Idioma activo. Empieza en el de la página para que la hidratación coincida con el HTML estático. */
export const lang = signal<Lang>(DEFAULT_LANG);
const dicts = signal<Partial<Record<Lang, Dict>>>({ [DEFAULT_LANG]: es as Dict });
/** Idioma con el que se generó la página (su URL): `/` es español, `/en/` inglés… */
let pageLang: Lang = DEFAULT_LANG;

/**
 * Fija el idioma de la página antes de pintar: en el build (cada idioma es un HTML) y al hidratar.
 * Las páginas que no son del idioma por defecto reciben su diccionario como prop, así el primer
 * render del cliente es idéntico al HTML generado.
 * Lee con peek() para que quien la llame no quede suscrito al idioma, y en el navegador solo
 * actúa una vez: después manda el selector de idioma.
 */
let seeded = false;
export function seedLang(l: Lang, dict?: Dict): void {
  if (seeded && typeof window !== 'undefined') return;
  seeded = true;
  pageLang = l;
  if (dict && !dicts.peek()[l]) dicts.value = { ...dicts.peek(), [l]: dict };
  if (lang.peek() !== l) lang.value = l;
}

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

/** Devuelve un traductor con prefijo opcional (`useT('origen')` → `t('title')` = `origen.title`). */
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

/** Buscadores y auditorías (Googlebot, Lighthouse…): siempre ven el idioma de la URL que piden. */
const BOT = /bot|crawl|spider|slurp|lighthouse|headless/i;

/**
 * Idioma con el que arranca la visita:
 * - En `/en/`, `/zh/`… manda la URL (es un enlace explícito a ese idioma).
 * - En la raíz se respeta el idioma que el visitante eligió antes y, si no eligió, el de su
 *   navegador. A los buscadores no se les cambia: así indexan cada URL con su propio idioma.
 */
function initialLang(): Lang {
  if (pageLang !== DEFAULT_LANG) return pageLang;
  if (navigator.webdriver || BOT.test(navigator.userAgent)) return DEFAULT_LANG;
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

/** Deja la cabecera como la del HTML de ese idioma: título, metas, canónica, lang y dir. */
function updateHead(l: Lang): void {
  const meta = LANG_META[l] ?? LANG_META[DEFAULT_LANG];
  const pageTitle = t('seo.title', { brand: BRAND_NAME });
  const description = t('seo.description');
  const root = document.documentElement;
  root.lang = meta.hreflang;
  root.dir = meta.dir;
  document.title = pageTitle;
  const setMeta = (attr: 'name' | 'property', name: string, content: string) => {
    document.head.querySelector(`meta[${attr}="${name}"]`)?.setAttribute('content', content);
  };
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', pageTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:locale', meta.ogLocale);
  setMeta('name', 'twitter:title', pageTitle);
  setMeta('name', 'twitter:description', description);
  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) {
    const url = new URL(langPath(l), canonical.href).href;
    canonical.href = url;
    setMeta('property', 'og:url', url);
  }
  // Los textos cambian de largo (y de dirección): recalcula las animaciones por scroll
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** La barra de direcciones muestra la URL del idioma activo (para compartirla o recargar). */
function updateUrl(l: Lang): void {
  const path = langPath(l);
  if (location.pathname === path) return;
  history.replaceState(history.state, '', `${path}${location.search}${location.hash}`);
}

/** Cambia el idioma en tiempo real (9 idiomas, incluidos RTL) y actualiza URL, título, metas, lang y dir. */
export async function setLang(l: Lang, persist = true): Promise<void> {
  await load(l);
  lang.value = l;
  updateHead(l);
  updateUrl(l);
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
  if (l !== lang.value) await setLang(l, false);
}
