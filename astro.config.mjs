import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Dominio público: canónicas, hreflang, sitemap y robots.txt salen de aquí.
 * Hoy la web vive en vibrance.corall.dev (la clienta aún no compra dominio). Cuando tenga uno,
 * se cambia aquí o se compila con SITE_URL=https://… npm run build
 */
const site = process.env.SITE_URL || 'https://vibrance.corall.dev';

// Mismos códigos que LANG_META.hreflang en src/config/brand.ts (el sitemap los usa en xhtml:link)
const locales = {
  es: 'es',
  en: 'en',
  zh: 'zh-Hans',
  fr: 'fr',
  it: 'it',
  ar: 'ar',
  he: 'he',
  ja: 'ja',
  ko: 'ko',
};

// SSG: `astro build` genera un HTML estático por idioma en dist/ (lo sirve nginx, ver Dockerfile).
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [preact(), sitemap({ i18n: { defaultLocale: 'es', locales } })],
  vite: {
    plugins: [tailwindcss()],
  },
});
