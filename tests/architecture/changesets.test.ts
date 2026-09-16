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
