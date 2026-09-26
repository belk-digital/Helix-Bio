import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'url'

// Throwaway config for scratch/verify-payment-risks.ts (real DB + test-mode Stripe; see its header).
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: [
      { find: /^@payload-config$/, replacement: fileURLToPath(new URL('../src/payload.config.ts', import.meta.url)) },
      { find: /^@\//, replacement: fileURLToPath(new URL('../src/', import.meta.url)) },
    ],
  },
  test: {
    environment: 'node',
    setupFiles: ['./scratch/verify-setup.ts'],
    include: ['scratch/verify-payment-risks.ts'],
    testTimeout: 280_000,
  },
})
