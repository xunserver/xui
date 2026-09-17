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
