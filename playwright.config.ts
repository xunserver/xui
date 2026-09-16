import { defineConfig, devices } from '@playwright/test'

const webServer = [
  {
    command: 'pnpm --filter @xui/fixture-vite-react preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm --filter @xui/fixture-no-tailwind preview',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm --filter @xui/fixture-company-theme preview',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm --filter @xui/fixture-next-rsc start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
]

export default defineConfig({
  testDir: 'tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer,
  projects: [
    { name: 'vite-react', use: { baseURL: 'http://127.0.0.1:4173' } },
    { name: 'no-tailwind', use: { baseURL: 'http://127.0.0.1:4174' } },
    { name: 'company-theme', use: { baseURL: 'http://127.0.0.1:4175' } },
    { name: 'next-rsc', use: { baseURL: 'http://127.0.0.1:3000' } },
  ],
})
