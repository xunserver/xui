import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readRepoJson, repoRoot } from './helpers.ts'

type Pkg = {
  name: string
  version: string
  private?: boolean
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  exports: Record<string, unknown>
}

const unpublished = [
  'packages/primitives',
  'packages/internal',
  'packages/utils',
  'packages/overlay',
  'packages/collection',
] as const

describe('package graph', () => {
  it('does not publish internal package names', () => {
    for (const rel of unpublished) {
      expect(existsSync(path.join(repoRoot(), rel))).toBe(false)
    }
  })

  it('keeps @xui/react free of data-grid and tailwind', () => {
    const react = readRepoJson<Pkg>('packages/react/package.json')
    expect(react.dependencies?.['@xui/data-grid']).toBeUndefined()
    expect(react.dependencies?.['@xui/tailwind']).toBeUndefined()
    expect(react.peerDependencies?.['@xui/data-grid']).toBeUndefined()
    expect(react.peerDependencies?.['@xui/tailwind']).toBeUndefined()
  })

  it('allows @xui/data-grid to depend on @xui/react as 0.x', () => {
    const grid = readRepoJson<Pkg>('packages/data-grid/package.json')
    expect(grid.name).toBe('@xui/data-grid')
    expect(grid.version).toBe('0.0.0')
    expect(grid.private).not.toBe(true)
    expect(grid.dependencies?.['@xui/react']).toBe('workspace:*')
    expect(grid.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
    })
    expect(grid.exports['./styles.css']).toBe('./dist/styles.css')
  })

  it('keeps @xui/tailwind as an optional CSS bridge', () => {
    const tw = readRepoJson<Pkg>('packages/tailwind/package.json')
    expect(tw.name).toBe('@xui/tailwind')
    expect(tw.version).toBe('0.0.0')
    expect(tw.dependencies?.['@xui/react']).toBeUndefined()
    expect(tw.peerDependencies?.tailwindcss).toBe('^4.0.0')
    expect(tw.exports['.']).toBe('./src/index.css')
    expect(tw.exports['./index.css']).toBe('./src/index.css')
  })
})
