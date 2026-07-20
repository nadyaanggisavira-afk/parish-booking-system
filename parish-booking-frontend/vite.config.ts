import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      // Enable the service worker in `npm run dev` too, so push can be tested locally.
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'Booking Ruang — Paroki St. Antonius Purbayan',
        short_name: 'Booking Paroki',
        description:
          'Ajukan dan pantau peminjaman ruang pertemuan Paroki St. Antonius Purbayan Surakarta.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f3f2f2',
        theme_color: '#f3f2f2',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Our own push / notificationclick handlers, layered on the generated SW.
        importScripts: ['push-sw.js'],
        // Uploaded PDFs are served by the API, not the SPA — never serve index.html for them.
        navigateFallbackDenylist: [/^\/uploads\//],
      },
    }),
  ],
  server: {
    port: 5173,
  },
})
