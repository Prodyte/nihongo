import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/nihongo/', // GitHub Pages serves the repo under /nihongo/
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // a new version waits for a tab screen (see App's update), never reloading mid-lesson
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,json}'], // json: kanji stroke order and examples, used in lessons
        // the 650 KB SQLite wasm is only for deck import: cached on first use, not downloaded on everyone's first visit
        runtimeCaching: [{ urlPattern: /\.wasm$/, handler: 'CacheFirst', options: { cacheName: 'wasm', expiration: { maxEntries: 1 } } }],
        navigateFallback: '/nihongo/index.html',
      },
      manifest: {
        name: 'Nihongo: learn Japanese',
        short_name: 'Nihongo',
        description: 'Learn Japanese from kana to JLPT N2: words, kanji and grammar with spaced repetition. Imports Anki decks.',
        lang: 'en',
        start_url: '/nihongo/',
        scope: '/nihongo/',
        display: 'standalone',
        background_color: '#fafaf7',
        theme_color: '#c0392b',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
