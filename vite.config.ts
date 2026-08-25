import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), {
    name: 'copy-resume',
    closeBundle() { copyFileSync(resolve(root, 'Резюме.pdf'), resolve(root, 'dist', 'Резюме.pdf')) },
  }],
  build: { target: 'es2018', cssCodeSplit: true, sourcemap: false },
})
