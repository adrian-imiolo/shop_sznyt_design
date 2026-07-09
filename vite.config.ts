/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // *.db.test.* needs Postgres and runs via backend's `npm run test:db`;
    // the root suite stays infra-free
    exclude: ['**/*.db.test.*', '**/node_modules/**'],
  },
})
