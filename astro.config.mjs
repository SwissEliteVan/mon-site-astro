// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // URL de production indispensable pour la génération du sitemap
  site: 'https://clicom.ch',
  
  integrations: [sitemap(), react()],
  // 1. Configuration du Prefetching (Préchargement des pages)
  prefetch: {
    // Active le préchargement sur tous les liens internes du site
    prefetchAll: true, 
    // Le préchargement s'active automatiquement lorsqu'on survole un lien (hover)
    defaultStrategy: 'hover' 
  },
  
  // Astro minifie le HTML par défaut en production, mais on le déclare explicitement
  compressHTML: true,

  vite: {
    plugins: [tailwindcss()],
    // 2. Configuration explicite de la minification JS et CSS via Vite
    build: {
      minify: 'esbuild',    // Minification JavaScript ultra-rapide
      cssMinify: 'esbuild', // Minification CSS
    }
  }
});