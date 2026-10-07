/**
 * Datos de marca centralizados.
 * TODO: dato real de la clienta — la marca aún no tiene nombre.
 * Cambiar BRAND_NAME aquí reemplaza el nombre en toda la web
 * (los textos de i18n lo reciben como parámetro {{ brand }}).
 */
export const BRAND_NAME = 'Aurora Fruits';

export const AVAILABLE_LANGS = ['es', 'en'] as const;
export type Lang = (typeof AVAILABLE_LANGS)[number];
export const DEFAULT_LANG: Lang = 'es';

/** Muestra una nota visible junto a cifras y logos de ejemplo. Poner en false al tener datos reales. */
export const SHOW_PLACEHOLDER_NOTES = true;

// TODO: dato real de la clienta
export const CONTACT = {
  email: 'comercial@ejemplo.com',
  phone: '+51 000 000 000',
  address: 'Lima, Perú',
  socials: [
    { id: 'linkedin', label: 'LinkedIn', href: '#' },
    { id: 'instagram', label: 'Instagram', href: '#' },
  ],
  privacyHref: '#',
} as const;
