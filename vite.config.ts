import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/nihongo/', // GitHub Pages serves the repo under /nihongo/
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,wasm,svg,png,webmanifest,json}'], // wasm: deck import must work offline; json: kanji stroke order
        navigateFallback: '/nihongo/index.html',
      },
      manifest: {
        name: 'Nihongo: learn Japanese',
        short_name: 'Nihongo',
        description: 'Learn Japanese from kana to JLPT N3: words, kanji and grammar with spaced repetition. Imports Anki decks.',
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
