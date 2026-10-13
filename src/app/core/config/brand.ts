/**
 * Datos de marca centralizados (decisión de la 1.ª reunión con la clienta).
 * - BRAND_NAME: marca principal, la que se ve en el logo.
 * - BRAND_DESCRIPTOR: descriptor de origen, más pequeño junto a la marca.
 * - LEGAL_NAME: razón social; solo footer, documentos y facturas (no va en el logo).
 * TODO: verificar "Vibrance" en INDECOPI / USPTO / EUIPO (clase 31) y el dominio.
 */
export const BRAND_NAME = 'Vibrance';
export const BRAND_DESCRIPTOR = 'Inca Harvest';
export const LEGAL_NAME = 'Vibrance Inca Harvest S.A.C.';
/** RUC (SUNAT) de la razón social; se muestra en el footer. */
export const RUC = '20615112446';

/**
 * Símbolo del logo (sol con hojas). Hay dos rutas en public/brand/:
 * - 'D': andenes curvos (se lee andino, no mesoamericano).
 * - 'C': andenes rectos escalonados (se lee mejor en tamaños muy pequeños).
 * Cambiar esta constante cambia el logo del header, el loader y el footer.
 * El favicon está en public/brand/favicon-*.png y public/favicon.ico (ruta D).
 */
export type LogoRoute = 'C' | 'D';
export const LOGO_ROUTE: LogoRoute = 'D';
export const LOGO = {
  /** Para fondos claros (header sólido). */
  light: `brand/logo-${LOGO_ROUTE}-claro.png`,
  /** Para fondos oscuros (header sobre el hero, loader, footer). */
  dark: `brand/logo-${LOGO_ROUTE}-oscuro.png`,
  width: 384,
  height: 232,
} as const;

/**
 * Idiomas de la web (mercados objetivo). Los textos están en public/i18n/{código}.json.
 * - ar (árabe) cubre Emiratos / Dubái y he (hebreo) cubre Israel; ambos se muestran de derecha a izquierda.
 * TODO: revisar fr, it, ja, ko, ar y he con un traductor nativo antes de publicar.
 */
export const AVAILABLE_LANGS = ['es', 'en', 'fr', 'it', 'ar', 'he', 'ja', 'ko'] as const;
export type Lang = (typeof AVAILABLE_LANGS)[number];
export const DEFAULT_LANG: Lang = 'es';

export interface LangMeta {
  /** Nombre del idioma en su propio idioma (así lo reconoce quien lo habla). */
  label: string;
  /** Código corto que se ve en el botón del selector. */
  short: string;
  dir: 'ltr' | 'rtl';
  /** Locale para Intl (números). En árabe se fuerzan dígitos latinos para las cifras. */
  locale: string;
  ogLocale: string;
}

export const LANG_META: Record<Lang, LangMeta> = {
  es: { label: 'Español', short: 'ES', dir: 'ltr', locale: 'es-PE', ogLocale: 'es_PE' },
  en: { label: 'English', short: 'EN', dir: 'ltr', locale: 'en-US', ogLocale: 'en_US' },
  fr: { label: 'Français', short: 'FR', dir: 'ltr', locale: 'fr-FR', ogLocale: 'fr_FR' },
  it: { label: 'Italiano', short: 'IT', dir: 'ltr', locale: 'it-IT', ogLocale: 'it_IT' },
  ar: { label: 'العربية', short: 'AR', dir: 'rtl', locale: 'ar-AE-u-nu-latn', ogLocale: 'ar_AE' },
  he: { label: 'עברית', short: 'HE', dir: 'rtl', locale: 'he-IL', ogLocale: 'he_IL' },
  ja: { label: '日本語', short: 'JA', dir: 'ltr', locale: 'ja-JP', ogLocale: 'ja_JP' },
  ko: { label: '한국어', short: 'KO', dir: 'ltr', locale: 'ko-KR', ogLocale: 'ko_KR' },
};

/** Muestra una nota visible junto a cifras y logos de ejemplo. Poner en false al tener datos reales. */
export const SHOW_PLACEHOLDER_NOTES = true;

// TODO: dato real de la clienta
export const CONTACT = {
  email: 'ventas@vibranceincaharvest.com',
  /** Teléfono de la empresa (footer). */
  phone: '+51 920 503 588',
  /** Número del botón flotante de WhatsApp (con código de país). */
  whatsapp: '+51 988 983 710',
  address: 'Lima, Perú',
  socials: [
    { id: 'linkedin', label: 'LinkedIn', href: '#' },
    { id: 'instagram', label: 'Instagram', href: '#' },
  ],
  privacyHref: '#',
} as const;
