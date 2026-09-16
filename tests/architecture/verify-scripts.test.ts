import { describe, expect, it } from 'vitest'
import { readRepoJson } from './helpers.ts'

type RootPackage = { scripts: Record<string, string> }

describe('verify scripts', () => {
  it('builds, typechecks, tests, and dry-run packs', () => {
    const pkg = readRepoJson<RootPackage>('package.json')
    expect(pkg.scripts['pack:check']).toBe(
      'pnpm build && pnpm --filter "./packages/**" exec npm pack --dry-run',
    )
    expect(pkg.scripts.verify).toBe(
      'pnpm build && pnpm typecheck && pnpm test && pnpm pack:check',
    )
  })
})
