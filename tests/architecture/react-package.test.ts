import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readRepoJson, readRepoText, repoRoot } from './helpers.ts'

type ExportEntry = string | { types?: string; import?: string; require?: string }

type ReactPackage = {
  name: string
  version: string
  type: string
  sideEffects: string[] | boolean
  main?: string
  types?: string
  exports: Record<string, ExportEntry>
  peerDependencies: Record<string, string>
  dependencies?: Record<string, string>
  files: string[]
}

describe('@xui/react', () => {
  it('publishes ESM-only React 19 exports without internal wildcards', () => {
    const pkg = readRepoJson<ReactPackage>('packages/react/package.json')
    expect(pkg.name).toBe('@xui/react')
    expect(pkg.version).toBe('0.0.0')
    expect(pkg.type).toBe('module')
    expect(pkg.peerDependencies.react).toBe('^19.0.0')
    expect(pkg.peerDependencies['react-dom']).toBe('^19.0.0')
    expect(pkg.peerDependencies.react).not.toContain('18')
    expect(pkg.dependencies?.['@xui/data-grid']).toBeUndefined()
    expect(pkg.dependencies?.['@xui/tailwind']).toBeUndefined()
    expect(pkg.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
    })
    const rootExport = pkg.exports['.']
    expect(typeof rootExport === 'object' && rootExport.require).toBeFalsy()
    expect(pkg.exports['./styles.css']).toBe('./dist/styles.css')
    expect(pkg.exports['./button']).toBeUndefined()
    expect(pkg.exports['./dist/internal/*']).toBeUndefined()
    expect(pkg.files).toEqual(expect.arrayContaining(['dist', 'README.md']))
  })

  it('does not import CSS from the JS entry', () => {
    expect(readRepoText('packages/react/src/index.ts')).not.toMatch(/\.css['"]/)
  })

  it('emits unbundled ESM, d.ts, source maps, and styles.css', () => {
    const dist = path.join(repoRoot(), 'packages/react/dist')
    expect(existsSync(path.join(dist, 'index.js'))).toBe(true)
    expect(existsSync(path.join(dist, 'index.d.ts'))).toBe(true)
    expect(existsSync(path.join(dist, 'index.js.map'))).toBe(true)
    expect(existsSync(path.join(dist, 'index.d.ts.map'))).toBe(true)
    expect(existsSync(path.join(dist, 'styles.css'))).toBe(true)
    const js = readFileSync(path.join(dist, 'index.js'), 'utf8')
    expect(js).toMatch(/\bexport\b/)
    expect(js).not.toMatch(/exports\./)
    expect(js).not.toMatch(/\brequire\(/)
  })
})
