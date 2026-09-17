import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readRepoJson, readRepoText, repoRoot } from './helpers.ts'

type RootPackage = {
  name: string
  private: boolean
  type: string
  packageManager: string
  engines: { node: string; pnpm: string }
  scripts: Record<string, string>
}

describe('workspace baseline', () => {
  it('pins pnpm 11, Node 22, and ESM', () => {
    const pkg = readRepoJson<RootPackage>('package.json')
    expect(pkg.name).toBe('xui')
    expect(pkg.private).toBe(true)
    expect(pkg.type).toBe('module')
    expect(pkg.packageManager).toBe('pnpm@11.25.0')
    expect(pkg.engines.node).toBe('>=22.13.0')
    expect(pkg.engines.pnpm).toBe('>=11')
    expect(pkg.scripts.test).toBe('vitest run')
  })

  it('includes packages and fixtures workspaces', () => {
    const yaml = readRepoText('pnpm-workspace.yaml')
    expect(yaml).toMatch(/packages\/\*/)
    expect(yaml).toMatch(/fixtures\/\*/)
  })

  it('keeps engine-strict on', () => {
    expect(readRepoText('.npmrc')).toContain('engine-strict=true')
  })

  it('ignores build outputs', () => {
    const ignore = readRepoText('.gitignore')
    expect(ignore).toContain('node_modules')
    expect(ignore).toContain('dist')
    expect(ignore).toContain('.next')
    expect(ignore).toContain('*.tsbuildinfo')
    expect(ignore).toContain('playwright-report')
  })

  it('has an MIT license file', () => {
    expect(existsSync(path.join(repoRoot(), 'LICENSE'))).toBe(true)
    expect(readRepoText('LICENSE')).toContain('MIT License')
  })
})
