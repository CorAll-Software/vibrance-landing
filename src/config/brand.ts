/**
 * Datos de marca centralizados (decisión de la 1.ª reunión con la clienta).
 * - BRAND_NAME: marca principal, la que se ve en el logo.
 * - BRAND_DESCRIPTOR: descriptor de origen, más pequeño junto a la marca.
 * - LEGAL_NAME: razón social; solo footer, documentos y facturas (no va en el logo).
 * TODO: verificar "Vibrance" en INDECOPI / USPTO / EUIPO (clase 31) y el dominio.
 */
import { MEDIA_URL } from './site';

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
// Rutas absolutas: la web tiene una carpeta por idioma (/en/, /zh/…) y una ruta relativa se rompería
export const LOGO = {
  /** Para fondos claros (header sólido). */
  light: `/brand/logo-mundo/completo-${WORLD_GREEN}-claro.svg`,
  /** Para fondos oscuros (header sobre el hero, loader, footer). */
  dark: `/brand/logo-mundo/completo-${WORLD_GREEN}-oscuro.svg`,
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
  /** Código BCP 47 para `<html lang>` y `hreflang` (el chino es simplificado: zh-Hans). */
  hreflang: string;
}

// prettier-ignore
export const LANG_META: Record<Lang, LangMeta> = {
  es: { label: 'Español', short: 'ES', dir: 'ltr', locale: 'es-PE', ogLocale: 'es_PE', hreflang: 'es' },
  en: { label: 'English', short: 'EN', dir: 'ltr', locale: 'en-US', ogLocale: 'en_US', hreflang: 'en' },
  zh: { label: '中文', short: 'ZH', dir: 'ltr', locale: 'zh-CN', ogLocale: 'zh_CN', hreflang: 'zh-Hans' },
  fr: { label: 'Français', short: 'FR', dir: 'ltr', locale: 'fr-FR', ogLocale: 'fr_FR', hreflang: 'fr' },
  it: { label: 'Italiano', short: 'IT', dir: 'ltr', locale: 'it-IT', ogLocale: 'it_IT', hreflang: 'it' },
  ar: { label: 'العربية', short: 'AR', dir: 'rtl', locale: 'ar-AE-u-nu-latn', ogLocale: 'ar_AE', hreflang: 'ar' },
  he: { label: 'עברית', short: 'HE', dir: 'rtl', locale: 'he-IL', ogLocale: 'he_IL', hreflang: 'he' },
  ja: { label: '日本語', short: 'JA', dir: 'ltr', locale: 'ja-JP', ogLocale: 'ja_JP', hreflang: 'ja' },
  ko: { label: '한국어', short: 'KO', dir: 'ltr', locale: 'ko-KR', ogLocale: 'ko_KR', hreflang: 'ko' },
};

/**
 * "Powered by" del footer: CorAll D&R, la empresa que desarrolló la web.
 * El logo (blanco, para el fondo oscuro del footer) vive en el bucket: se genera con
 * branding/bucket/generar.mjs y se sube a brand/corall.webp. Si no carga, se muestra el
 * nombre en texto. Con `href` vacío se muestra sin enlace.
 */
export const POWERED_BY = {
  name: 'CorAll',
  href: 'https://coralldar.com',
  logo: `${MEDIA_URL}/brand/corall.webp`,
  width: 362,
  height: 72,
} as const;

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
 * Envío del formulario de cotización con Web3Forms (https://web3forms.com).
 * La clave de acceso es pública y está ligada al correo de destino que se registró en su panel
 * (ventas@vibranceincaharvest.com en producción). Mientras esté vacía el formulario solo simula el envío.
 */
export const QUOTE_ENDPOINT = 'https://api.web3forms.com/submit';
export const QUOTE_ACCESS_KEY = 'ad5b6598-8dbe-4d68-917e-5a83bb38f2ac';
