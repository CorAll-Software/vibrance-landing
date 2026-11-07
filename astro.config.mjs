import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// SSG: `astro build` genera HTML estático en dist/ (lo sirve nginx, ver Dockerfile).
export default defineConfig({
  output: 'static',
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
