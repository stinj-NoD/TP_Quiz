/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// Doit correspondre au nom du dépôt GitHub (stinj-NoD/TP_Quiz), pas au nom de l'app :
// c'est le chemin servi par GitHub Pages. Ne pas "corriger" en /Ludopia/ tant que le
// dépôt n'a pas été renommé, sous peine de casser le déploiement.
const base = process.env.GITHUB_PAGES ? '/TP_Quiz/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Ludopia',
        short_name: 'Ludopia',
        description: "Ludopia, l'univers de jeux entre amis : quiz et mode Géographie.",
        theme_color: '#7c3aed',
        background_color: '#0a0a14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Volontairement sans `webp` : les 190 illustrations de Conquête (~10 Mo) ne doivent pas
        // être imposées au premier chargement. Elles sont mises en cache à l'usage via
        // runtimeCaching ci-dessous, ce qui rend le mode jouable hors ligne après une partie.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'image' && url.pathname.endsWith('.webp'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ludopia-card-art',
              expiration: {
                // Large de côté : la banque complète fait 190 cartes.
                maxEntries: 250,
                maxAgeSeconds: 60 * 60 * 24 * 90,
                purgeOnQuotaError: true,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
