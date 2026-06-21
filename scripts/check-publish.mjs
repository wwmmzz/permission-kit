import { readFileSync, rmSync, mkdtempSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const binDir = join(rootDir, 'node_modules', '.bin')
const packages = ['packages/core', 'packages/react', 'packages/vite-plugin']

function bin(name) {
  return process.platform === 'win32' ? join(binDir, `${name}.cmd`) : join(binDir, name)
}

function run(command, args, cwd = rootDir) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

for (const pkg of packages) {
  const packageDir = join(rootDir, pkg)
  const packageJson = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'))
  const packedName = `${packageJson.name.replace(/^@/, '').replace(/\//g, '-')}-${packageJson.version}.tgz`
  const packDir = mkdtempSync(join(tmpdir(), 'permission-kit-pack-'))

  console.log(`\n==> publint ${pkg}`)
  run(bin('publint'), ['run', pkg, '--pack', 'pnpm', '--strict'])

  console.log(`\n==> attw ${pkg}`)
  run('pnpm', ['pack', '--pack-destination', packDir], packageDir)
  run(bin('attw'), [join(packDir, packedName), '--summary', '--no-emoji'])

  rmSync(packDir, { recursive: true, force: true })
}
