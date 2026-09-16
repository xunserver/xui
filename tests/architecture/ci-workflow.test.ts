import { describe, expect, it } from 'vitest'
import { readRepoText } from './helpers.ts'

describe('ci workflow', () => {
  it('runs verify and browser tests on Node 22 with pnpm 11', () => {
    const yaml = readRepoText('.github/workflows/ci.yml')
    expect(yaml).toContain('node-version: 22')
    expect(yaml).toContain('version: 11.25.0')
    expect(yaml).toContain('pnpm install --frozen-lockfile')
    expect(yaml).toContain('pnpm exec playwright install chromium --with-deps')
    expect(yaml).toContain('pnpm verify')
    expect(yaml).toContain('pnpm test:browser')
  })
})
