import { expect, test } from '@playwright/test'

const titles: Record<string, string> = {
  'vite-react': 'XUI vite-react fixture',
  'no-tailwind': 'XUI no-tailwind fixture',
  'company-theme': 'XUI company-theme fixture',
  'next-rsc': 'XUI next-rsc fixture',
}

test('fixture heading is visible without page errors', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })
  await page.goto('/')
  const heading = titles[testInfo.project.name]
  if (!heading) {
    throw new Error(`unknown project ${testInfo.project.name}`)
  }
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  expect(errors).toEqual([])
})
