import { describe, expect, it } from 'vitest'
import { readRepoJson, readRepoText } from './helpers.ts'

type Pkg = {
  name: string
  private: boolean
  dependencies?: Record<string, string>
  scripts: Record<string, string>
}

describe('next-rsc fixture', () => {
  it('is a server component page that imports XUI CSS and the React package', () => {
    const pkg = readRepoJson<Pkg>('fixtures/next-rsc/package.json')
    expect(pkg.name).toBe('@xui/fixture-next-rsc')
    expect(pkg.private).toBe(true)
    expect(pkg.dependencies?.next).toBe('15.5.25')
    expect(pkg.dependencies?.react).toBe('19.1.0')
    expect(pkg.dependencies?.['@xui/react']).toBe('workspace:*')
    expect(pkg.dependencies?.['@xui/theme']).toBe('workspace:*')
    expect(pkg.scripts.start).toContain('--port 3000')
    const page = readRepoText('fixtures/next-rsc/app/page.tsx')
    expect(page).not.toContain('use client')
    expect(page).toContain('from \'@xui/react\'')
    expect(page).toContain('XUI next-rsc fixture')
    const layout = readRepoText('fixtures/next-rsc/app/layout.tsx')
    expect(layout).toContain('data-xui-theme="trading-dark"')
    const css = readRepoText('fixtures/next-rsc/app/globals.css')
    expect(css).toContain('@import "@xui/theme/trading-dark.css"')
    expect(css).toContain('@import "@xui/react/styles.css"')
  })
})
