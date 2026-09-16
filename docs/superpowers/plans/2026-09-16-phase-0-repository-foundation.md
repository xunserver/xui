# Phase 0 Repository Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the XUI pnpm monorepo so `@xui/theme`, `@xui/react`, `@xui/tailwind`, and `@xui/data-grid` are real packages with explicit exports, an unbundled ESM library build, Vitest + Playwright, Changesets, consumer fixtures, and CI — without implementing tokens or components yet.

**Architecture:** Follow the frozen package graph and repository layout. Theme and Tailwind are CSS-only packages. React and DataGrid emit unbundled ES2022 ESM + `.d.ts` + source maps via TypeScript project references. Fixtures prove consumption without Tailwind, with Tailwind, with a replacement company theme, and from a Next.js App Router server component. No component catalog, no token values, no behavior engine.

**Tech Stack:** pnpm `11.25.0`, Node `>=22.13.0`, TypeScript `5.9.2`, React `19.1.0`, Vitest `3.2.4`, Vite `7.1.12`, `@vitejs/plugin-react` `5.1.4`, Next.js `15.5.25`, Playwright `@playwright/test` `1.55.0`, Changesets `@changesets/cli` `3.0.3`, Tailwind CSS `4.3.3` (vite-react fixture only).

**Spec:** `docs/architecture.md` (XUI Architecture v1, Architecture Freeze; sections 2, 45–59, 61–62, 66). If that file is not on the current branch, rebase onto the architecture-docs branch / merged `main` before implementing.

## Global Constraints

Copied from `docs/architecture.md`. Every task implicitly includes this section.

- ARCH-001: Core Components must not depend on trading business semantics.
- ARCH-003: Tailwind is an Integration Layer, not a Core runtime/build dependency.
- ARCH-004: Component correctness must not depend on the host Tailwind compiler scanning XUI source or `node_modules`.
- ARCH-006: Visual values use CSS Variables + CSS Cascade.
- ARCH-007: React Context must not carry visual token values.
- ARCH-010: Third-party engine APIs/types must not leak into XUI Public API.
- ARCH-014: Data fetching, persistence, routing, form state and domain state are application responsibilities.
- ARCH-015: Documented CSS classes, data attributes, CSS variables and behavioral defaults are SemVer-governed public contracts.
- ARCH-016: XUI v1 does not implement a Docking / IDE Workspace engine.
- ARCH-017: DataGrid is a separate high-performance subsystem, not an advanced `Table`.
- ARCH-019: Accessibility is default behavior, not an optional feature flag.
- Published packages only: `@xui/react`, `@xui/theme`, `@xui/tailwind`, `@xui/data-grid`.
- Do not initially publish: `@xui/primitives`, `@xui/internal`, `@xui/utils`, `@xui/overlay`, `@xui/collection`.
- Baseline: Modern browser, ES2022-class output, React 19 baseline.
- Do not initially carry: CommonJS, UMD, legacy browser polyfills, React 18 compatibility layer.
- Public import shapes to preserve (component subpaths are added when those components exist, not in Phase 0): `import { Button } from '@xui/react'` and `import { Button } from '@xui/react/button'`.
- Do not publish wildcard internal subpaths such as `@xui/react/dist/internal/*`.
- Explicit application CSS imports. Component JS must not silently inject global CSS.
- Official theme CSS and component CSS are separate: `@import "@xui/theme/trading-dark.css"` and `@import "@xui/react/styles.css"`.
- `@xui/tailwind` targets Tailwind CSS v4 and is optional. Core React components must work without this package.
- Forbidden dependencies: `@xui/react → @xui/data-grid`, `@xui/react → @xui/tailwind`.
- Allowed: `@xui/data-grid` may depend on `@xui/react`.
- Top-level module evaluation must not access `window`, `document`, `localStorage`, `ResizeObserver`, or register global events.
- Independent SemVer for public packages. `@xui/data-grid` stays `0.x` / beta. Core 1.0 must not be blocked by DataGrid stability.
- Use a changeset-based release process.
- Required fixtures: `fixtures/vite-react`, `fixtures/next-rsc`, `fixtures/no-tailwind`, `fixtures/company-theme`.
- `no-tailwind` must verify core XUI works without Tailwind installed.
- `company-theme` must verify the official trading theme can be replaced.
- `next-rsc` must verify client boundaries, SSR, hydration, package exports, and CSS.
- Release tests must install the actual packed artifact, not only workspace source.
- Phase 0 deliverable is repository foundation only. Do not implement semantic token values, density scales, Button/Input/Field/Popover/Dialog, or a behavior engine.

---

## File Structure

Create these files. Do not add `packages/primitives`, `packages/internal`, `packages/utils`, `packages/overlay`, `packages/collection`, `apps/docs`, `apps/benchmarks`, or `examples/trading-terminal` in this plan.

```text
xui/
├─ package.json                          # workspace scripts, engines, packageManager
├─ pnpm-workspace.yaml                   # packages/* + fixtures/*
├─ pnpm-lock.yaml                        # generated by pnpm install, commit it
├─ .npmrc
├─ .gitignore
├─ LICENSE                               # MIT
├─ README.md                             # modify: development commands
├─ tsconfig.json                         # solution references
├─ tsconfig.base.json                    # shared compiler options
├─ vitest.config.ts
├─ playwright.config.ts
├─ scripts/copy-css.mjs                  # copy package src CSS into dist/
├─ .changeset/config.json
├─ .changeset/README.md
├─ .github/workflows/ci.yml
├─ packages/theme/
│  ├─ package.json
│  ├─ README.md
│  └─ src/{tokens,trading-dark,trading-light}.css
├─ packages/tailwind/
│  ├─ package.json
│  ├─ README.md
│  └─ src/index.css
├─ packages/react/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ README.md
│  └─ src/{index.ts,styles.css}
├─ packages/data-grid/
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ README.md
│  └─ src/{index.ts,styles.css}
├─ fixtures/vite-react/                  # Vite + React + Tailwind v4 + official theme
├─ fixtures/no-tailwind/                 # Vite + React, no tailwindcss dependency
├─ fixtures/company-theme/               # Vite + React + replacement theme CSS
├─ fixtures/next-rsc/                    # Next 15 App Router server page
├─ tests/architecture/                   # package graph / export / RSC contract tests
├─ tests/package-artifact/               # packed tarball install test
└─ tests/browser/                        # Playwright fixture smoke tests
```

Responsibility boundaries:

- `packages/theme` — public theme CSS contract (`tokens.css`, `trading-dark.css`, `trading-light.css`). No JS.
- `packages/react` — public React package. Phase 0 ships an empty ESM entry and `styles.css`. No components.
- `packages/tailwind` — optional Tailwind v4 CSS bridge. Phase 0 ships an empty `@theme inline` file.
- `packages/data-grid` — independent `0.x` package. May depend on `@xui/react`. Phase 0 ships an empty ESM entry and `styles.css`.
- `fixtures/*` — consumer applications. They depend on workspace packages; they are not published.
- `tests/architecture` — SemVer/graph/export contracts that later phases must not break.
- `tests/package-artifact` — install packed tarballs in a throwaway directory.
- `tests/browser` — real browser proof that each fixture boots.

---

### Task 1: Workspace baseline and Vitest runner

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `vitest.config.ts`
- Create: `tests/architecture/helpers.ts`
- Create: `tests/architecture/workspace.test.ts`
- Test: `tests/architecture/workspace.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: root `package.json` with `packageManager: "pnpm@11.25.0"`, `engines.node: ">=22.13.0"`, `engines.pnpm: ">=11"`, `type: "module"`, script `test` = `vitest run`. Workspace globs `packages/*` and `fixtures/*`. Helper `repoRoot(): string`, `readRepoText(relativePath: string): string`, `readRepoJson<T>(relativePath: string): T`.

- [ ] **Step 1: Write the failing test and helpers**

Create `tests/architecture/helpers.ts`:

```ts
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function repoRoot(): string {
  return path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
}

export function readRepoText(relativePath: string): string {
  return readFileSync(path.join(repoRoot(), relativePath), 'utf8')
}

export function readRepoJson<T>(relativePath: string): T {
  return JSON.parse(readRepoText(relativePath)) as T
}
```

Create `tests/architecture/workspace.test.ts`:

```ts
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
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/src/**/*.test.tsx',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],
    exclude: ['node_modules', 'dist', 'packages/*/dist', 'fixtures/**'],
    environment: 'node',
    testTimeout: 30_000,
  },
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
node --input-type=module -e "import('vitest').catch(() => process.exit(1))"
```

Expected: FAIL because `vitest` is not installed and `package.json` / workspace files are missing. If `package.json` is still the old `# xui` repo with no test runner, `pnpm test` is not defined.

- [ ] **Step 3: Write minimal implementation**

Create `package.json`:

```json
{
  "name": "xui",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.25.0",
  "engines": {
    "node": ">=22.13.0",
    "pnpm": ">=11"
  },
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "@types/node": "22.20.3",
    "typescript": "5.9.2",
    "vitest": "3.2.4"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "fixtures/*"

allowBuilds:
  esbuild: true
```

Create `.npmrc`:

```
engine-strict=true
strict-peer-dependencies=false
auto-install-peers=false
```

Create `.gitignore`:

```
node_modules
dist
coverage
.cache
.DS_Store
*.log
.pnpm-debug.log*
*.tsbuildinfo
playwright-report
test-results
blob-report
.next
fixtures/*/.next
```

Create `LICENSE`:

```
MIT License

Copyright (c) 2026 xunserver

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Enable the pinned pnpm and install:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/workspace.test.ts
```

Expected: PASS (1 file, 5 tests).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc .gitignore LICENSE vitest.config.ts tests/architecture/helpers.ts tests/architecture/workspace.test.ts
git commit -m "chore: add pnpm workspace baseline and vitest runner"
```

---

### Task 2: TypeScript solution and `@xui/theme` CSS package

**Files:**
- Create: `tsconfig.base.json`
- Create: `tsconfig.json`
- Create: `packages/theme/package.json`
- Create: `packages/theme/README.md`
- Create: `packages/theme/src/tokens.css`
- Create: `packages/theme/src/trading-dark.css`
- Create: `packages/theme/src/trading-light.css`
- Test: `tests/architecture/theme-exports.test.ts`

**Interfaces:**
- Consumes: workspace from Task 1.
- Produces: `@xui/theme` `0.0.0` with export map:
  - `./tokens.css` → `./src/tokens.css`
  - `./trading-dark.css` → `./src/trading-dark.css`
  - `./trading-light.css` → `./src/trading-light.css`
  No `.` JS export. `sideEffects: ["**/*.css"]`. TypeScript solution file exists with empty `references` until Task 3.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/theme-exports.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/theme-exports.test.ts
```

Expected: FAIL with `ENOENT` for `packages/theme/package.json` or `Cannot find module '@xui/theme/package.json'`.

- [ ] **Step 3: Write minimal implementation**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "skipLibCheck": true
  }
}
```

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": []
}
```

Create `packages/theme/package.json`:

```json
{
  "name": "@xui/theme",
  "version": "0.0.0",
  "description": "XUI semantic theme CSS (trading-dark / trading-light).",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    "./tokens.css": "./src/tokens.css",
    "./trading-dark.css": "./src/trading-dark.css",
    "./trading-light.css": "./src/trading-light.css",
    "./package.json": "./package.json"
  },
  "files": ["src", "README.md"],
  "publishConfig": {
    "access": "public"
  }
}
```

Create `packages/theme/README.md`:

````md
# @xui/theme

Official XUI theme CSS. Applications import theme files explicitly:

```css
@import "@xui/theme/trading-dark.css";
```

Semantic token values are added in Phase 1. This package has no JavaScript entry.
````

Create `packages/theme/src/tokens.css`:

```css
/* Reference token inputs. Public semantic values land in Phase 1. */
```

Create `packages/theme/src/trading-dark.css`:

```css
/* Default XUI theme: trading-dark. Semantic assignments land in Phase 1. */
```

Create `packages/theme/src/trading-light.css`:

```css
/* Official light companion to trading-dark. Semantic assignments land in Phase 1. */
```

```bash
pnpm install
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/theme-exports.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tsconfig.base.json tsconfig.json packages/theme tests/architecture/theme-exports.test.ts pnpm-lock.yaml
git commit -m "feat(theme): add @xui/theme CSS package exports"
```

---

### Task 3: `@xui/react` unbundled ESM build and component CSS export

**Files:**
- Create: `scripts/copy-css.mjs`
- Create: `packages/react/package.json`
- Create: `packages/react/tsconfig.json`
- Create: `packages/react/README.md`
- Create: `packages/react/src/index.ts`
- Create: `packages/react/src/styles.css`
- Modify: `package.json` (add `build`, `typecheck` scripts)
- Modify: `tsconfig.json` (reference `packages/react`)
- Test: `tests/architecture/react-package.test.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` from Task 2.
- Produces:
  - `pnpm build` runs `tsc -b --pretty false && node scripts/copy-css.mjs`
  - `@xui/react` `0.0.0` peer `react` and `react-dom` `^19.0.0` (not `^18`)
  - Export `.` → `{ types: "./dist/index.d.ts", import: "./dist/index.js" }`
  - Export `./styles.css` → `./dist/styles.css`
  - No `exports["."].require`, no `./dist/internal/*`, no `./button` yet
  - `packages/react/src/index.ts` is `export {}` and does not import CSS
  - `copyCss(["react", "data-grid"])` copies `src/**/*.css` into `dist/` (data-grid copy is a no-op until Task 4)

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/react-package.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/react-package.test.ts
```

Expected: FAIL with `ENOENT: packages/react/package.json`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/copy-css.mjs`:

```js
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const packages = ['react', 'data-grid']

function copyCss(fromDir, toDir) {
  if (!existsDir(fromDir)) {
    return
  }
  mkdirSync(toDir, { recursive: true })
  for (const name of readdirSync(fromDir)) {
    const from = path.join(fromDir, name)
    const to = path.join(toDir, name)
    if (statSync(from).isDirectory()) {
      copyCss(from, to)
    } else if (name.endsWith('.css')) {
      mkdirSync(path.dirname(to), { recursive: true })
      copyFileSync(from, to)
    }
  }
}

function existsDir(dir) {
  try {
    return statSync(dir).isDirectory()
  } catch {
    return false
  }
}

for (const pkg of packages) {
  copyCss(path.join('packages', pkg, 'src'), path.join('packages', pkg, 'dist'))
}
```

Create `packages/react/package.json`:

```json
{
  "name": "@xui/react",
  "version": "0.0.0",
  "description": "XUI React components.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc -b --pretty false",
    "typecheck": "tsc -b --pretty false"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

Create `packages/react/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"],
    "types": []
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

Create `packages/react/src/index.ts`:

```ts
export {}
```

Create `packages/react/src/styles.css`:

```css
/* Precompiled component CSS. Structural rules land with the first components. */
```

Create `packages/react/README.md`:

````md
# @xui/react

```ts
import { Button } from '@xui/react'
```

```css
@import "@xui/react/styles.css";
```

Applications must import theme CSS separately from `@xui/theme`. Components are added starting in Phase 3.
````

Replace `tsconfig.json` with:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/react" }
  ]
}
```

Update root `package.json` `scripts` to:

```json
{
  "build": "tsc -b --pretty false && node scripts/copy-css.mjs",
  "typecheck": "tsc -b --pretty false",
  "test": "vitest run"
}
```

Keep the existing `devDependencies` and add:

```json
{
  "@types/react": "19.1.8",
  "@types/react-dom": "19.1.6",
  "react": "19.1.0",
  "react-dom": "19.1.0"
}
```

Root needs React only so later unit tests can import it; fixtures also declare their own copies.

```bash
pnpm install
pnpm build
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/react-package.test.ts
```

Expected: PASS. Also run `pnpm typecheck` — Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json scripts/copy-css.mjs packages/react tests/architecture/react-package.test.ts
git commit -m "feat(react): add @xui/react ESM build and styles.css export"
```

---

### Task 4: `@xui/tailwind`, `@xui/data-grid`, and dependency direction

**Files:**
- Create: `packages/tailwind/package.json`
- Create: `packages/tailwind/README.md`
- Create: `packages/tailwind/src/index.css`
- Create: `packages/data-grid/package.json`
- Create: `packages/data-grid/tsconfig.json`
- Create: `packages/data-grid/README.md`
- Create: `packages/data-grid/src/index.ts`
- Create: `packages/data-grid/src/styles.css`
- Modify: `tsconfig.json` (add data-grid reference)
- Test: `tests/architecture/package-graph.test.ts`

**Interfaces:**
- Consumes: `@xui/react` from Task 3; `copy-css.mjs` already lists `data-grid`.
- Produces:
  - `@xui/tailwind` `0.0.0`, export `.` and `./index.css` → `./src/index.css`, peer `tailwindcss: ^4.0.0`, no dependency on `@xui/react`
  - `@xui/data-grid` `0.0.0`, dependency `@xui/react: workspace:*`, same ESM export shape as react plus `./styles.css`
  - No directories `packages/primitives`, `packages/internal`, `packages/utils`, `packages/overlay`, `packages/collection`
  - Function-less contract test `assertNoForbiddenDeps()` encoded in `package-graph.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/package-graph.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/package-graph.test.ts
```

Expected: FAIL with `ENOENT` for `packages/data-grid/package.json` and/or `packages/tailwind/package.json`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/tailwind/package.json`:

```json
{
  "name": "@xui/tailwind",
  "version": "0.0.0",
  "description": "Optional Tailwind CSS v4 bridge for XUI semantic tokens.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": "./src/index.css",
    "./index.css": "./src/index.css",
    "./package.json": "./package.json"
  },
  "files": ["src", "README.md"],
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "tailwindcss": "^4.0.0"
  },
  "peerDependenciesMeta": {
    "tailwindcss": {
      "optional": true
    }
  }
}
```

Create `packages/tailwind/src/index.css`:

```css
@theme inline {
  /* Token → Tailwind mappings land in Phase 1. Keep namespaced: bg-xui-*, not bg-primary. */
}
```

Create `packages/tailwind/README.md`:

````md
# @xui/tailwind

Optional Tailwind CSS v4 bridge:

```css
@import "@xui/tailwind";
```

Core `@xui/react` works without this package.
````

Create `packages/data-grid/package.json`:

```json
{
  "name": "@xui/data-grid",
  "version": "0.0.0",
  "description": "XUI DataGrid beta. Independent of Core 1.0 stability.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles.css": "./dist/styles.css",
    "./package.json": "./package.json"
  },
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc -b --pretty false",
    "typecheck": "tsc -b --pretty false"
  },
  "dependencies": {
    "@xui/react": "workspace:*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

Create `packages/data-grid/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"],
    "types": []
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"],
  "references": [{ "path": "../react" }]
}
```

Create `packages/data-grid/src/index.ts`:

```ts
export {}
```

Create `packages/data-grid/src/styles.css`:

```css
/* DataGrid CSS is independent of Table. Rules land in the DataGrid beta phase. */
```

Create `packages/data-grid/README.md`:

````md
# @xui/data-grid

High-performance DataGrid subsystem (`0.x` / beta). Not an advanced Table.

```css
@import "@xui/data-grid/styles.css";
```
````

Replace `tsconfig.json` with:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/react" },
    { "path": "./packages/data-grid" }
  ]
}
```

```bash
pnpm install
pnpm build
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/package-graph.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json packages/tailwind packages/data-grid tests/architecture/package-graph.test.ts pnpm-lock.yaml
git commit -m "feat: add @xui/tailwind and @xui/data-grid package skeletons"
```

---

### Task 5: RSC top-level boundary scan

**Files:**
- Test: `tests/architecture/rsc-boundary.test.ts`

**Interfaces:**
- Consumes: `packages/react/src/index.ts` and `packages/data-grid/src/index.ts`.
- Produces: `scanSourceForBrowserGlobals(source: string): string[]` used only in this test file (inline is fine). Forbidden at module top level: `window`, `document`, `localStorage`, `ResizeObserver`, plus `addEventListener` on `globalThis`.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/rsc-boundary.test.ts`:

```ts
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
```

This test should already pass on the empty `export {}` entries. That is intended: it locks the constraint before components exist.

- [ ] **Step 2: Run test to verify it fails**

Temporarily add `window.alert('x')` at the top of `packages/react/src/index.ts`, then:

```bash
pnpm test tests/architecture/rsc-boundary.test.ts
```

Expected: FAIL with `packages/react/src/index.ts matches /\\bwindow\\b/`.

- [ ] **Step 3: Write minimal implementation**

Restore `packages/react/src/index.ts` to:

```ts
export {}
```

No other production code is required.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/rsc-boundary.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/architecture/rsc-boundary.test.ts packages/react/src/index.ts
git commit -m "test: forbid browser globals at React package top level"
```

---

### Task 6: Changesets independent SemVer

**Files:**
- Create: `.changeset/config.json`
- Create: `.changeset/README.md`
- Modify: `package.json` (add `changeset` and `release` scripts, add `@changesets/cli`)
- Test: `tests/architecture/changesets.test.ts`

**Interfaces:**
- Consumes: public package names from Tasks 2–4.
- Produces: Changesets `access: "public"`, `baseBranch: "main"`, `updateInternalDependencies: "patch"`, `fixed: []`, `linked: []`, `ignore` listing the four fixture package names. Independent versions (not a fixed core group). Script `changeset` = `changeset`.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/changesets.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { readRepoJson } from './helpers.ts'

type ChangesetConfig = {
  access: string
  baseBranch: string
  updateInternalDependencies: string
  fixed: unknown[]
  linked: unknown[]
  ignore: string[]
}

type RootPackage = { scripts: Record<string, string> }

describe('changesets', () => {
  it('uses independent public SemVer and ignores fixtures', () => {
    const config = readRepoJson<ChangesetConfig>('.changeset/config.json')
    expect(config.access).toBe('public')
    expect(config.baseBranch).toBe('main')
    expect(config.updateInternalDependencies).toBe('patch')
    expect(config.fixed).toEqual([])
    expect(config.linked).toEqual([])
    expect(config.ignore).toEqual(
      expect.arrayContaining([
        '@xui/fixture-vite-react',
        '@xui/fixture-next-rsc',
        '@xui/fixture-no-tailwind',
        '@xui/fixture-company-theme',
      ]),
    )
    const root = readRepoJson<RootPackage>('package.json')
    expect(root.scripts.changeset).toBe('changeset')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/changesets.test.ts
```

Expected: FAIL with `ENOENT: .changeset/config.json`.

- [ ] **Step 3: Write minimal implementation**

Create `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@xui/fixture-vite-react",
    "@xui/fixture-next-rsc",
    "@xui/fixture-no-tailwind",
    "@xui/fixture-company-theme"
  ]
}
```

Create `.changeset/README.md`:

```md
# Changesets

Independent SemVer for `@xui/react`, `@xui/theme`, `@xui/tailwind`, and `@xui/data-grid`.

`@xui/data-grid` stays on the `0.x` line until its own beta process says otherwise. Core 1.0 is not blocked by DataGrid.
```

Add to root `package.json`:

```json
{
  "scripts": {
    "changeset": "changeset"
  },
  "devDependencies": {
    "@changesets/cli": "3.0.3"
  }
}
```

Keep existing scripts/devDependencies and merge. Then:

```bash
pnpm install
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/changesets.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .changeset package.json pnpm-lock.yaml tests/architecture/changesets.test.ts
git commit -m "chore: add independent SemVer changesets"
```

---

### Task 7: `fixtures/vite-react` and `fixtures/no-tailwind`

**Files:**
- Create: `fixtures/vite-react/package.json`
- Create: `fixtures/vite-react/tsconfig.json`
- Create: `fixtures/vite-react/vite.config.ts`
- Create: `fixtures/vite-react/index.html`
- Create: `fixtures/vite-react/src/main.tsx`
- Create: `fixtures/vite-react/src/App.tsx`
- Create: `fixtures/vite-react/src/index.css`
- Create: `fixtures/no-tailwind/package.json`
- Create: `fixtures/no-tailwind/tsconfig.json`
- Create: `fixtures/no-tailwind/vite.config.ts`
- Create: `fixtures/no-tailwind/index.html`
- Create: `fixtures/no-tailwind/src/main.tsx`
- Create: `fixtures/no-tailwind/src/App.tsx`
- Create: `fixtures/no-tailwind/src/index.css`
- Test: `tests/architecture/fixtures-vite.test.ts`

**Interfaces:**
- Consumes: `@xui/theme` and `@xui/react` workspace packages. `pnpm build` must have been run so `dist/` exists.
- Produces:
  - `@xui/fixture-vite-react` private, depends on `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `vite@7.1.12`, `@vitejs/plugin-react@5.1.4`, `react@19.1.0`, `react-dom@19.1.0`, `@xui/react`, `@xui/theme`. Scripts: `dev`, `build`, `preview` (`vite preview --host 127.0.0.1 --port 4173 --strictPort`).
  - `@xui/fixture-no-tailwind` private, **must not** list `tailwindcss` or `@xui/tailwind` in `dependencies` or `devDependencies`. Preview port `4174`.
  - Both render `h1` text exactly: `XUI vite-react fixture` and `XUI no-tailwind fixture`.
  - Both wrap the page in `data-xui-theme="trading-dark"` and `data-xui-density="compact"`.
  - Both import `@xui/theme/trading-dark.css` and `@xui/react/styles.css`.
  - `vite-react` CSS also has `@import "tailwindcss";`.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/fixtures-vite.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/fixtures-vite.test.ts
```

Expected: FAIL with `ENOENT: fixtures/vite-react/package.json`.

- [ ] **Step 3: Write minimal implementation**

Create `fixtures/vite-react/package.json`:

```json
{
  "name": "@xui/fixture-vite-react",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5173 --strictPort",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4173 --strictPort"
  },
  "dependencies": {
    "@xui/react": "workspace:*",
    "@xui/theme": "workspace:*",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "tailwindcss": "4.3.3"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.3.3",
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "@vitejs/plugin-react": "5.1.4",
    "vite": "7.1.12"
  }
}
```

Create `fixtures/vite-react/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Create `fixtures/vite-react/vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Create `fixtures/vite-react/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XUI vite-react</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `fixtures/vite-react/src/index.css`:

```css
@import "tailwindcss";
@import "@xui/theme/trading-dark.css";
@import "@xui/react/styles.css";
```

Create `fixtures/vite-react/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element missing')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Create `fixtures/vite-react/src/App.tsx`:

```tsx
export function App() {
  return (
    <div data-xui-theme="trading-dark" data-xui-density="compact">
      <h1>XUI vite-react fixture</h1>
    </div>
  )
}
```

Create `fixtures/no-tailwind/package.json`:

```json
{
  "name": "@xui/fixture-no-tailwind",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5174 --strictPort",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4174 --strictPort"
  },
  "dependencies": {
    "@xui/react": "workspace:*",
    "@xui/theme": "workspace:*",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "@vitejs/plugin-react": "5.1.4",
    "vite": "7.1.12"
  }
}
```

Create `fixtures/no-tailwind/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Create `fixtures/no-tailwind/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
```

Create `fixtures/no-tailwind/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XUI no-tailwind</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `fixtures/no-tailwind/src/index.css`:

```css
@import "@xui/theme/trading-dark.css";
@import "@xui/react/styles.css";
```

Create `fixtures/no-tailwind/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element missing')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Create `fixtures/no-tailwind/src/App.tsx`:

```tsx
export function App() {
  return (
    <div data-xui-theme="trading-dark" data-xui-density="compact">
      <h1>XUI no-tailwind fixture</h1>
    </div>
  )
}
```

```bash
pnpm install
pnpm build
pnpm --filter @xui/fixture-vite-react build
pnpm --filter @xui/fixture-no-tailwind build
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/fixtures-vite.test.ts
```

Expected: PASS. Fixture `build` commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add fixtures/vite-react fixtures/no-tailwind tests/architecture/fixtures-vite.test.ts pnpm-lock.yaml
git commit -m "test: add vite-react and no-tailwind consumer fixtures"
```

---

### Task 8: `fixtures/company-theme`

**Files:**
- Create: `fixtures/company-theme/package.json`
- Create: `fixtures/company-theme/tsconfig.json`
- Create: `fixtures/company-theme/vite.config.ts`
- Create: `fixtures/company-theme/index.html`
- Create: `fixtures/company-theme/src/main.tsx`
- Create: `fixtures/company-theme/src/App.tsx`
- Create: `fixtures/company-theme/src/index.css`
- Create: `fixtures/company-theme/src/company-theme.css`
- Test: `tests/architecture/fixtures-company-theme.test.ts`

**Interfaces:**
- Consumes: `@xui/react` only for component CSS. Must **not** import `@xui/theme/trading-dark.css` or `@xui/theme/trading-light.css`.
- Produces: `@xui/fixture-company-theme`, preview port `4175`, heading `XUI company-theme fixture`, host attribute `data-xui-theme="company"`, local file `src/company-theme.css` that applications use instead of the official trading theme.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/fixtures-company-theme.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/fixtures-company-theme.test.ts
```

Expected: FAIL with `ENOENT: fixtures/company-theme/package.json`.

- [ ] **Step 3: Write minimal implementation**

Create `fixtures/company-theme/package.json`:

```json
{
  "name": "@xui/fixture-company-theme",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1 --port 5175 --strictPort",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1 --port 4175 --strictPort"
  },
  "dependencies": {
    "@xui/react": "workspace:*",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "@vitejs/plugin-react": "5.1.4",
    "vite": "7.1.12"
  }
}
```

Create `fixtures/company-theme/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Create `fixtures/company-theme/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
})
```

Create `fixtures/company-theme/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>XUI company-theme</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `fixtures/company-theme/src/company-theme.css`:

```css
[data-xui-theme='company'] {
  /* Company replacement theme. Token names land in Phase 1; this fixture proves the import path. */
  color-scheme: light;
}
```

Create `fixtures/company-theme/src/index.css`:

```css
@import "./company-theme.css";
@import "@xui/react/styles.css";
```

Create `fixtures/company-theme/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

const root = document.getElementById('root')
if (!root) {
  throw new Error('root element missing')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Create `fixtures/company-theme/src/App.tsx`:

```tsx
export function App() {
  return (
    <div data-xui-theme="company" data-xui-density="compact">
      <h1>XUI company-theme fixture</h1>
    </div>
  )
}
```

```bash
pnpm install
pnpm --filter @xui/fixture-company-theme build
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/fixtures-company-theme.test.ts
```

Expected: PASS. Fixture build exits 0.

- [ ] **Step 5: Commit**

```bash
git add fixtures/company-theme tests/architecture/fixtures-company-theme.test.ts pnpm-lock.yaml
git commit -m "test: add company-theme replacement fixture"
```

---

### Task 9: `fixtures/next-rsc`

**Files:**
- Create: `fixtures/next-rsc/package.json`
- Create: `fixtures/next-rsc/tsconfig.json`
- Create: `fixtures/next-rsc/next.config.ts`
- Create: `fixtures/next-rsc/next-env.d.ts`
- Create: `fixtures/next-rsc/app/globals.css`
- Create: `fixtures/next-rsc/app/layout.tsx`
- Create: `fixtures/next-rsc/app/page.tsx`
- Test: `tests/architecture/fixtures-next-rsc.test.ts`

**Interfaces:**
- Consumes: `@xui/react` and `@xui/theme`. The Next `app/page.tsx` module must **not** contain `'use client'`. Importing `@xui/react` from a Server Component must succeed.
- Produces: `@xui/fixture-next-rsc` with `next@15.5.25`, `react@19.1.0`, `react-dom@19.1.0`. Scripts: `dev` port 3000, `build` = `next build`, `start` = `next start --hostname 127.0.0.1 --port 3000`. Heading `XUI next-rsc fixture`. Layout imports theme + component CSS. `transpilePackages` is not required if package exports point at `dist/`; do not add it unless `next build` fails to resolve the workspace exports.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/fixtures-next-rsc.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/fixtures-next-rsc.test.ts
```

Expected: FAIL with `ENOENT: fixtures/next-rsc/package.json`.

- [ ] **Step 3: Write minimal implementation**

Create `fixtures/next-rsc/package.json`:

```json
{
  "name": "@xui/fixture-next-rsc",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --hostname 127.0.0.1 --port 3000",
    "build": "next build",
    "start": "next start --hostname 127.0.0.1 --port 3000"
  },
  "dependencies": {
    "@xui/react": "workspace:*",
    "@xui/theme": "workspace:*",
    "next": "15.5.25",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@types/react": "19.1.8",
    "@types/react-dom": "19.1.6",
    "typescript": "5.9.2"
  }
}
```

Create `fixtures/next-rsc/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "allowJs": false,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Create `fixtures/next-rsc/next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default nextConfig
```

Create `fixtures/next-rsc/next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

Create `fixtures/next-rsc/app/globals.css`:

```css
@import "@xui/theme/trading-dark.css";
@import "@xui/react/styles.css";
```

Create `fixtures/next-rsc/app/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div data-xui-theme="trading-dark" data-xui-density="compact">
          {children}
        </div>
      </body>
    </html>
  )
}
```

Create `fixtures/next-rsc/app/page.tsx`:

```tsx
import {} from '@xui/react'

export default function Page() {
  return <h1>XUI next-rsc fixture</h1>
}
```

The `import {} from '@xui/react'` line is required so Next typechecking and bundling actually resolve the package export. Do not add `'use client'`.

```bash
pnpm install
pnpm build
pnpm --filter @xui/fixture-next-rsc build
```

If `next build` fails because CSS from `node_modules` is rejected, add this to `next.config.ts` and re-run (only if needed):

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@xui/react', '@xui/theme'],
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/fixtures-next-rsc.test.ts
```

Expected: PASS. `next build` exits 0.

- [ ] **Step 5: Commit**

```bash
git add fixtures/next-rsc tests/architecture/fixtures-next-rsc.test.ts pnpm-lock.yaml
git commit -m "test: add next-rsc server component fixture"
```

---

### Task 10: Playwright fixture smoke tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/browser/fixtures.spec.ts`
- Modify: `package.json` (add `@playwright/test` and `test:browser`)
- Test: `tests/browser/fixtures.spec.ts`

**Interfaces:**
- Consumes: fixture preview/start scripts from Tasks 7–9. Root script `test:browser` = `pnpm --filter "./fixtures/**" run build && playwright test`.
- Produces: four Playwright projects:
  - `vite-react` baseURL `http://127.0.0.1:4173`
  - `no-tailwind` baseURL `http://127.0.0.1:4174`
  - `company-theme` baseURL `http://127.0.0.1:4175`
  - `next-rsc` baseURL `http://127.0.0.1:3000`
  Chromium only. `webServer` starts the four hosts. Each spec asserts the fixture `h1` is visible and no `pageerror` fired.

- [ ] **Step 1: Write the failing test**

Create `tests/browser/fixtures.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const titles: Record<string, string> = {
  'vite-react': 'XUI vite-react fixture',
  'no-tailwind': 'XUI no-tailwind fixture',
  'company-theme': 'XUI company-theme fixture',
  'next-rsc': 'XUI next-rsc fixture',
}

test('fixture heading is visible without page errors', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    errors.push(error.message)
  })
  await page.goto('/')
  const heading = titles[testInfo.project.name]
  if (!heading) {
    throw new Error(`unknown project ${testInfo.project.name}`)
  }
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  expect(errors).toEqual([])
})
```

Create `playwright.config.ts` after the test file exists so the run command has a config to load. If you write config first, the test still fails because `@playwright/test` is missing.

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec playwright test
```

Expected: FAIL because `@playwright/test` is not installed and/or `test:browser` is missing.

- [ ] **Step 3: Write minimal implementation**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

const webServer = [
  {
    command: 'pnpm --filter @xui/fixture-vite-react preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm --filter @xui/fixture-no-tailwind preview',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm --filter @xui/fixture-company-theme preview',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
  },
  {
    command: 'pnpm --filter @xui/fixture-next-rsc start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
]

export default defineConfig({
  testDir: 'tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer,
  projects: [
    { name: 'vite-react', use: { baseURL: 'http://127.0.0.1:4173' } },
    { name: 'no-tailwind', use: { baseURL: 'http://127.0.0.1:4174' } },
    { name: 'company-theme', use: { baseURL: 'http://127.0.0.1:4175' } },
    { name: 'next-rsc', use: { baseURL: 'http://127.0.0.1:3000' } },
  ],
})
```

Merge into root `package.json`:

```json
{
  "scripts": {
    "test:browser": "pnpm --filter \"./fixtures/**\" run build && playwright test"
  },
  "devDependencies": {
    "@playwright/test": "1.55.0"
  }
}
```

```bash
pnpm install
pnpm exec playwright install chromium
pnpm build
```

Preview/start require a prior fixture build; `test:browser` does that.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test:browser
```

Expected: PASS, 4 projects × 1 test. Headings visible. `errors` array empty (hydration errors fail this test).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/browser/fixtures.spec.ts package.json pnpm-lock.yaml
git commit -m "test: add Playwright smoke tests for consumer fixtures"
```

---

### Task 11: Packed artifact install test

**Files:**
- Create: `tests/package-artifact/packed-install.test.ts`
- Modify: `package.json` (add `pack:check` and `verify`)
- Test: `tests/package-artifact/packed-install.test.ts`

**Interfaces:**
- Consumes: `pnpm pack` output from `@xui/theme` and `@xui/react`.
- Produces: root scripts
  - `pack:check` = `pnpm build && pnpm --filter "./packages/**" exec npm pack --dry-run`
  - `verify` = `pnpm build && pnpm typecheck && pnpm test && pnpm pack:check`
  Test creates a temp directory, installs the two tarballs with `npm install --omit=dev`, then runs `node --input-type=module` importing `@xui/react` and reading `@xui/theme/trading-dark.css` via `createRequire`. Timeout 60s.

- [ ] **Step 1: Write the failing test**

Create `tests/package-artifact/packed-install.test.ts`:

```ts
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
```

Add `*.tgz` to `.gitignore` so packed files are not committed:

```
*.tgz
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/package-artifact/packed-install.test.ts
```

Expected: may fail on `pack:check` missing from `verify`, or pass the pack itself. If `files` omitted `dist` this test fails with `Cannot find package '@xui/react'`. If it unexpectedly passes, keep it — it is the release gate. The failing assertion we require in this task is that `package.json` does not yet define `verify` / `pack:check`; add this extra test to `tests/architecture/workspace.test.ts` (or a tiny new file) if you want a guaranteed red:

Create `tests/architecture/verify-scripts.test.ts`:

```ts
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
```

Run:

```bash
pnpm test tests/architecture/verify-scripts.test.ts
```

Expected: FAIL with `undefined` for `pack:check`.

- [ ] **Step 3: Write minimal implementation**

Merge scripts into root `package.json`:

```json
{
  "scripts": {
    "build": "tsc -b --pretty false && node scripts/copy-css.mjs",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:browser": "pnpm --filter \"./fixtures/**\" run build && playwright test",
    "pack:check": "pnpm build && pnpm --filter \"./packages/**\" exec npm pack --dry-run",
    "verify": "pnpm build && pnpm typecheck && pnpm test && pnpm pack:check",
    "changeset": "changeset"
  }
}
```

Ensure `.gitignore` contains `*.tgz`.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/verify-scripts.test.ts tests/package-artifact/packed-install.test.ts
```

Expected: PASS. Then:

```bash
pnpm verify
```

Expected: PASS (build, typecheck, all vitest files, dry-run pack).

- [ ] **Step 5: Commit**

```bash
git add tests/package-artifact/packed-install.test.ts tests/architecture/verify-scripts.test.ts package.json .gitignore
git commit -m "test: install packed @xui/theme and @xui/react artifacts"
```

---

### Task 12: GitHub Actions CI and README

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `AGENTS.md` (only if the file exists from the architecture-docs change)
- Test: `tests/architecture/ci-workflow.test.ts`

**Interfaces:**
- Consumes: `pnpm verify` and `pnpm test:browser` from Tasks 10–11.
- Produces: workflow `CI` on `push` and `pull_request`, Node `22`, pnpm `11.25.0`, frozen lockfile, `pnpm exec playwright install chromium --with-deps`, then `pnpm verify` then `pnpm test:browser`. README documents `pnpm install`, `pnpm verify`, `pnpm test:browser`.

- [ ] **Step 1: Write the failing test**

Create `tests/architecture/ci-workflow.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { readRepoText } from './helpers.ts'

describe('ci workflow', () => {
  it('runs verify and browser tests on Node 22 with pnpm 11', () => {
    const yaml = readRepoText('.github/workflows/ci.yml')
    expect(yaml).toContain('node-version: 22')
    expect(yaml).toContain('version: 11.25.0')
    expect(yaml).toContain('pnpm install --frozen-lockfile')
    expect(yaml).toContain('pnpm exec playwright install chromium --with-deps')
    expect(yaml).toContain('pnpm verify')
    expect(yaml).toContain('pnpm test:browser')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test tests/architecture/ci-workflow.test.ts
```

Expected: FAIL with `ENOENT: .github/workflows/ci.yml`.

- [ ] **Step 3: Write minimal implementation**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  ci:
    name: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.25.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Install Chromium
        run: pnpm exec playwright install chromium --with-deps
      - name: Verify
        run: pnpm verify
      - name: Browser fixtures
        run: pnpm test:browser
```

Replace `README.md` with (if the architecture-docs README already exists, **append** the Development section instead of deleting the agent-tooling section):

````md
# xui

Desktop-first React UI foundation. Architecture is frozen in [`docs/architecture.md`](docs/architecture.md).

## Development

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install
pnpm verify
pnpm test:browser
```

`pnpm verify` builds unbundled ESM, typechecks, runs contract tests, and dry-run packs public packages.

Consumer fixtures live in `fixtures/`:

- `vite-react` — Vite + React 19 + Tailwind CSS v4 + official trading-dark
- `no-tailwind` — same stack without Tailwind
- `company-theme` — replaces official theme CSS
- `next-rsc` — Next.js 15 App Router server page
````

If `AGENTS.md` exists, change `Implementation has not started yet.` to `Phase 0 repository foundation is specified in docs/superpowers/plans/2026-09-16-phase-0-repository-foundation.md.`

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test tests/architecture/ci-workflow.test.ts
pnpm verify
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml README.md AGENTS.md tests/architecture/ci-workflow.test.ts
git commit -m "ci: run verify and Playwright fixtures on Node 22"
```

---

## Out of scope (follow-up plans)

Do not implement these in this plan. After Phase 0 merges, write new plan files:

1. `docs/superpowers/plans/YYYY-MM-DD-phase-1-design-foundation.md` — semantic tokens, trading-dark/light values, density, typography, motion, CSS layers, Tailwind bridge mappings (`docs/architecture.md` §§4–8, 50–51).
2. `docs/superpowers/plans/YYYY-MM-DD-phase-2-internal-infrastructure.md` — composition `render`, `mergeProps` / `mergeRefs`, controlled state, primitive adapter, portal, focus, overlay, presence (`docs/architecture.md` §§9–14, 62 Phase 2).
3. `docs/superpowers/plans/YYYY-MM-DD-phase-3-first-validation-components.md` — Button, Input, Field, Popover, Dialog only (`docs/architecture.md` §62 Phase 3, §§15–16, 19–20).

Later phases (forms, overlay/navigation, desktop, DataGrid beta, trading-terminal, 1.0 RC) stay blocked on those plans.

---

## Self-review

**1. Spec coverage (Phase 0 slice of §62):**

| Spec item | Task |
| --- | --- |
| pnpm workspace | 1 |
| package structure (`packages/{react,theme,tailwind,data-grid}`) | 2–4 |
| TypeScript / ES2022 / NodeNext | 2–3 |
| library build unbundled ESM + d.ts + source maps | 3–4 |
| Vitest | 1 |
| Playwright | 10 |
| Changesets independent SemVer | 6 |
| package exports (no internal wildcards, CSS split) | 2–4 |
| fixtures vite-react / no-tailwind / company-theme / next-rsc | 7–9 |
| CI | 12 |
| React 19, no React 18 layer, no CJS `require` export | 3 |
| `@xui/react` ↛ `@xui/data-grid` / `@xui/tailwind` | 4 |
| Do not publish primitives/internal/utils/overlay/collection | 4 |
| JS does not inject CSS | 3 |
| RSC: no window/document at top level | 5 |
| Packed artifact install | 11 |
| DataGrid 0.x and optional Tailwind | 4 |
| Theme/component CSS separate imports | 2–3, 7–9 |

Not in this plan (correctly deferred): token values, density scales, Button/Input/Field/Popover/Dialog, behavior engine, docs app, benchmarks, trading-terminal.

**2. Placeholder scan:** no TBD/TODO implementation steps. Empty CSS files are intentional Phase 0 artifacts with comments that state what Phase 1 will add; they are importable contracts, not omitted work.

**3. Type consistency:** package names, export paths, fixture names, ports (4173/4174/4175/3000), scripts (`build`, `typecheck`, `test`, `test:browser`, `pack:check`, `verify`, `changeset`), and peer ranges (`react`/`react-dom` `^19.0.0`, `tailwindcss` `^4.0.0`) are reused unchanged across tasks.
