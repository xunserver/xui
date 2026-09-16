import { describe, expect, it } from 'vitest'
import { readRepoJson, readRepoText } from './helpers.ts'

type Pkg = {
  name: string
  private: boolean
  dependencies?: Record<string, string>
  scripts: Record<string, string>
}

describe('company-theme fixture', () => {
  it('replaces the official trading theme', () => {
    const pkg = readRepoJson<Pkg>('fixtures/company-theme/package.json')
    expect(pkg.name).toBe('@xui/fixture-company-theme')
    expect(pkg.private).toBe(true)
    expect(pkg.dependencies?.['@xui/react']).toBe('workspace:*')
    expect(pkg.scripts.preview).toContain('--port 4175')
    const css = readRepoText('fixtures/company-theme/src/index.css')
    expect(css).toContain('@import "./company-theme.css"')
    expect(css).toContain('@import "@xui/react/styles.css"')
    expect(css).not.toContain('trading-dark')
    expect(css).not.toContain('trading-light')
    expect(css).not.toContain('@xui/theme')
    const app = readRepoText('fixtures/company-theme/src/App.tsx')
    expect(app).toContain('data-xui-theme="company"')
    expect(app).toContain('XUI company-theme fixture')
    const theme = readRepoText('fixtures/company-theme/src/company-theme.css')
    expect(theme).toContain('data-xui-theme="company"')
  })
})
