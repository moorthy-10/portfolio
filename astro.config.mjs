// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO: replace with the real production URL (used for canonical, og:image and the sitemap).
const SITE = process.env.SITE_URL ?? 'https://veilu-portfolio.vercel.app';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
