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
 * Símbolo del logo: sol con hojas sobre un mundo y mariposa con estela (feedback del 18-oct).
 * Los SVG están en public/brand/logo-mundo/ y salen de branding/logo/generar-logo.mjs.
 * La clienta pidió probar tres verdes para el mundo:
 * - 'hoja': #4F7A3A (el mismo verde de las hojas).
 * - 'vivo': #6BAA3A.
 * - 'lima': #8CC152 (verde lima suave).
 * Cambiar esta constante cambia el logo del header, el loader y el footer.
 * El favicon sigue siendo el del logo anterior (public/brand/favicon-*.png) hasta elegir el verde.
 * El logo anterior (andenes, rutas C y D) queda en public/brand/logo-{C,D}-*.png.
 */
export type WorldGreen = 'hoja' | 'vivo' | 'lima';
export const WORLD_GREEN: WorldGreen = 'hoja';
export const LOGO = {
  /** Para fondos claros (header sólido). */
  light: `brand/logo-mundo/completo-${WORLD_GREEN}-claro.svg`,
  /** Para fondos oscuros (header sobre el hero, loader, footer). */
  dark: `brand/logo-mundo/completo-${WORLD_GREEN}-oscuro.svg`,
  width: 400,
  height: 270,
} as const;

/**
 * Idiomas de la web (mercados objetivo). Los textos están en public/i18n/{código}.json.
 * - ar (árabe) cubre Emiratos / Dubái y he (hebreo) cubre Israel; ambos se muestran de derecha a izquierda.
 * TODO: revisar fr, it, ja, ko, ar y he con un traductor nativo antes de publicar.
 */
export const AVAILABLE_LANGS = ['es', 'en', 'zh', 'fr', 'it', 'ar', 'he', 'ja', 'ko'] as const;
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
  zh: { label: '中文', short: 'ZH', dir: 'ltr', locale: 'zh-CN', ogLocale: 'zh_CN' },
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
  /** Compradores (cotizaciones, consultas). */
  email: 'ventas@vibranceincaharvest.com',
  /** Productores que quieren vender su fruta con Vibrance. Siempre va con su etiqueta. */
  partnersEmail: 'aliados@vibranceincaharvest.com',
  /**
   * Teléfono de la empresa. No se muestra en la web (pedido de la clienta: ningún número
   * escrito, solo el correo y el botón de WhatsApp). Más adelante pasa a ser el de WhatsApp.
   */
  phone: '+51 920 503 588',
  /** Número de los botones de WhatsApp (con código de país). Nunca se muestra en pantalla. */
  whatsapp: '+51 988 983 710',
  address: 'Lima, Perú',
  socials: [
    { id: 'linkedin', label: 'LinkedIn', href: '#' },
    { id: 'instagram', label: 'Instagram', href: '#' },
  ],
} as const;

/** Oculta los íconos de redes del footer hasta que existan las cuentas (pedido de la clienta). */
export const SHOW_SOCIALS = false;

/**
 * Endpoint de Formspree del formulario de cotización (https://formspree.io/f/xxxxxxxx).
 * Mientras esté vacío el formulario solo simula el envío.
 */
export const QUOTE_ENDPOINT = '';
