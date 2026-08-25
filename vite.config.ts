import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const deploymentHost = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL ?? 'dianavolf.ru'
const deploymentUrl = `https://${deploymentHost}`

export default defineConfig({
  plugins: [react(), {
    name: 'copy-resume',
    closeBundle() { copyFileSync(resolve(root, 'Резюме.pdf'), resolve(root, 'dist', 'Резюме.pdf')) },
    transformIndexHtml(html) { return html.replaceAll('https://dianavolf.ru', deploymentUrl) },
  }],
  build: { target: 'es2018', cssCodeSplit: true, sourcemap: false },
})
