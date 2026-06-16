// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless'; // CHANGEMENT ICI

// https://astro.build/config
export default defineConfig({
  site: 'https://clicom.ch',
  output: 'hybrid', // AJOUT ICI
  integrations: [sitemap(), react()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: 'esbuild',
      cssMinify: 'esbuild',
    }
  },
  adapter: vercel({
    // AJOUT ICI pour les analytics Vercel
    webAnalytics: {
      enabled: true,
    },
    speedInsights: {
      enabled: true,
    },
  })
});