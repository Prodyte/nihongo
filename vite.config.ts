import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/nihongo/', // GitHub Pages serves the repo under /nihongo/
  plugins: [react()],
})
