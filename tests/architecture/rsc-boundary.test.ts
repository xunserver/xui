import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from './helpers.ts'

const forbidden = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bResizeObserver\b/,
]

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      out.push(...walk(full))
    } else if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js')) {
      if (!name.endsWith('.test.ts') && !name.endsWith('.test.tsx')) {
        out.push(full)
      }
    }
  }
  return out
}

describe('RSC / SSR module top-level', () => {
  it('does not touch browser globals in published TS/JS', () => {
    const roots = [
      path.join(repoRoot(), 'packages/react/src'),
      path.join(repoRoot(), 'packages/data-grid/src'),
    ]
    const hits: string[] = []
    for (const root of roots) {
      for (const file of walk(root)) {
        const source = readFileSync(file, 'utf8')
        for (const pattern of forbidden) {
          if (pattern.test(source)) {
            hits.push(`${path.relative(repoRoot(), file)} matches ${pattern}`)
          }
        }
      }
    }
    expect(hits).toEqual([])
  })
})
