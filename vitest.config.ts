import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/src/**/*.test.tsx',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],
    exclude: ['node_modules', 'dist', 'packages/*/dist', 'fixtures/**'],
    environment: 'node',
    testTimeout: 30_000,
  },
})
