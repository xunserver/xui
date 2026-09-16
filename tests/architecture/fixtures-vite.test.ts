import { describe, expect, it } from 'vitest'
import { readRepoJson, readRepoText } from './helpers.ts'

type Pkg = {
  name: string
  private: boolean
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts: Record<string, string>
}

describe('vite fixtures', () => {
  it('vite-react uses official theme, XUI CSS, and Tailwind v4', () => {
    const pkg = readRepoJson<Pkg>('fixtures/vite-react/package.json')
    expect(pkg.name).toBe('@xui/fixture-vite-react')
    expect(pkg.private).toBe(true)
    expect(pkg.dependencies?.['@xui/react']).toBe('workspace:*')
    expect(pkg.dependencies?.['@xui/theme']).toBe('workspace:*')
    expect(pkg.dependencies?.tailwindcss).toBe('4.3.3')
    expect(pkg.scripts.preview).toContain('--port 4173')
    const css = readRepoText('fixtures/vite-react/src/index.css')
    expect(css).toContain('@import "tailwindcss"')
    expect(css).toContain('@import "@xui/theme/trading-dark.css"')
    expect(css).toContain('@import "@xui/react/styles.css"')
    const app = readRepoText('fixtures/vite-react/src/App.tsx')
    expect(app).toContain('data-xui-theme="trading-dark"')
    expect(app).toContain('data-xui-density="compact"')
    expect(app).toContain('XUI vite-react fixture')
  })

  it('no-tailwind works without Tailwind packages', () => {
    const pkg = readRepoJson<Pkg>('fixtures/no-tailwind/package.json')
    expect(pkg.name).toBe('@xui/fixture-no-tailwind')
    expect(pkg.private).toBe(true)
    expect(pkg.dependencies?.tailwindcss).toBeUndefined()
    expect(pkg.devDependencies?.tailwindcss).toBeUndefined()
    expect(pkg.dependencies?.['@xui/tailwind']).toBeUndefined()
    expect(pkg.devDependencies?.['@xui/tailwind']).toBeUndefined()
    expect(pkg.scripts.preview).toContain('--port 4174')
    const css = readRepoText('fixtures/no-tailwind/src/index.css')
    expect(css).not.toContain('tailwindcss')
    expect(css).toContain('@import "@xui/theme/trading-dark.css"')
    expect(css).toContain('@import "@xui/react/styles.css"')
    const app = readRepoText('fixtures/no-tailwind/src/App.tsx')
    expect(app).toContain('XUI no-tailwind fixture')
  })
})
