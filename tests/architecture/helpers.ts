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
