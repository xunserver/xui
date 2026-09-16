import { createRequire } from 'node:module'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readRepoJson, readRepoText, repoRoot } from './helpers.ts'

type ThemePackage = {
  name: string
  version: string
  private?: boolean
  type: string
  sideEffects: string[] | boolean
  exports: Record<string, string>
  files: string[]
}

describe('@xui/theme', () => {
  it('is a public CSS package with explicit theme exports', () => {
    const pkg = readRepoJson<ThemePackage>('packages/theme/package.json')
    expect(pkg.name).toBe('@xui/theme')
    expect(pkg.version).toBe('0.0.0')
    expect(pkg.private).not.toBe(true)
    expect(pkg.type).toBe('module')
    expect(pkg.sideEffects).toEqual(['**/*.css'])
    expect(pkg.exports['./tokens.css']).toBe('./src/tokens.css')
    expect(pkg.exports['./trading-dark.css']).toBe('./src/trading-dark.css')
    expect(pkg.exports['./trading-light.css']).toBe('./src/trading-light.css')
    expect(pkg.exports['.']).toBeUndefined()
    expect(pkg.files).toEqual(expect.arrayContaining(['src', 'README.md']))
  })

  it('resolves CSS subpaths from the package name', () => {
    const require = createRequire(import.meta.url)
    const themeRoot = path.dirname(
      require.resolve('@xui/theme/package.json', { paths: [repoRoot()] }),
    )
    expect(readRepoText(path.relative(repoRoot(), path.join(themeRoot, 'src/trading-dark.css')))).toContain('trading-dark')
    expect(readRepoText(path.relative(repoRoot(), path.join(themeRoot, 'src/trading-light.css')))).toContain('trading-light')
    expect(readRepoText(path.relative(repoRoot(), path.join(themeRoot, 'src/tokens.css')))).toContain('Reference')
  })
})
