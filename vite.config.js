import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cloudflare's Rocket Loader rewrites script tags so they wait for its own loader at the end of
// the page; data-cfasync="false" keeps the site's scripts loading straight away.
const skipRocketLoader = {
  name: 'skip-rocket-loader',
  transformIndexHtml: {
    order: 'post',
    handler: (html) => html.replace(/<script(?![^>]*data-cfasync)/g, '<script data-cfasync="false"'),
  },
}

// The fonts the intro and map use are otherwise only requested once the app has rendered text;
// preloading them fetches them alongside the scripts.
const FIRST_VIEW_FONTS = /^assets\/(inter-latin-wght-normal|barlow-semi-condensed-latin-(600-normal|700-italic))-.*\.woff2$/
const preloadFonts = {
  name: 'preload-fonts',
  transformIndexHtml: {
    order: 'post',
    handler: (html, { bundle }) =>
      Object.keys(bundle || {})
        .filter((f) => FIRST_VIEW_FONTS.test(f))
        .map((f) => ({ tag: 'link', attrs: { rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: '' }, injectTo: 'head' })),
  },
}

export default defineConfig({
  plugins: [react(), skipRocketLoader, preloadFonts],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
})
