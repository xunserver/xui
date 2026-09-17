import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { repoRoot } from '../architecture/helpers.ts'

describe('packed artifacts', () => {
  it('installs @xui/theme and @xui/react from tarballs', () => {
    const root = repoRoot()
    execFileSync('pnpm', ['build'], { cwd: root, stdio: 'inherit' })
    execFileSync('pnpm', ['--filter', '@xui/theme', 'exec', 'npm', 'pack'], {
      cwd: root,
      stdio: 'inherit',
    })
    execFileSync('pnpm', ['--filter', '@xui/react', 'exec', 'npm', 'pack'], {
      cwd: root,
      stdio: 'inherit',
    })
    const themeTgz = readdirSync(path.join(root, 'packages/theme')).find((name) =>
      name.endsWith('.tgz'),
    )
    const reactTgz = readdirSync(path.join(root, 'packages/react')).find((name) =>
      name.endsWith('.tgz'),
    )
    expect(themeTgz).toBeDefined()
    expect(reactTgz).toBeDefined()
    const tmp = mkdtempSync(path.join(os.tmpdir(), 'xui-artifact-'))
    writeFileSync(
      path.join(tmp, 'package.json'),
      JSON.stringify({
        name: 'xui-artifact-consumer',
        private: true,
        type: 'module',
      }),
    )
    execFileSync(
      'npm',
      [
        'install',
        '--omit=dev',
        path.join(root, 'packages/theme', themeTgz!),
        path.join(root, 'packages/react', reactTgz!),
      ],
      { cwd: tmp, stdio: 'inherit' },
    )
    const result = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import {} from '@xui/react'; import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); require.resolve('@xui/theme/trading-dark.css'); console.log('ok')",
      ],
      { cwd: tmp, encoding: 'utf8' },
    )
    expect(result).toContain('ok')
  }, 60_000)
})
