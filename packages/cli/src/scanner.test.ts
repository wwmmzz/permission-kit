import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { describe, expect, it } from 'vitest'
import { buildManifest, createDts, scanProject } from './scanner'

describe('scanner', () => {
  it('builds a structured manifest from usages', () => {
    const manifest = buildManifest([
      {
        permission: 'user.delete',
        file: 'src/b.tsx',
        line: 10,
        column: 3,
        component: 'button'
      },
      {
        permission: 'user.create',
        file: 'src/a.tsx',
        line: 4,
        column: 5,
        component: 'button'
      }
    ])

    expect(manifest.summary).toEqual({
      permissions: 2,
      usages: 2,
      files: 2
    })
    expect(manifest.permissions.map((item) => item.permission)).toEqual([
      'user.create',
      'user.delete'
    ])
  })

  it('scans jsx files and generates permission usages', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'permission-kit-cli-'))

    try {
      await mkdir(path.join(root, 'src'), { recursive: true })
      await writeFile(
        path.join(root, 'src', 'App.tsx'),
        `const view = <button permission="user.create">Create</button>`,
        'utf-8'
      )

      const manifest = await scanProject({
        cwd: root,
        include: ['src/**/*.{ts,tsx,jsx}']
      })

      expect(manifest.permissions).toHaveLength(1)
      expect(manifest.permissions[0]?.permission).toBe('user.create')
      expect(manifest.permissions[0]?.usages[0]?.file).toContain('src/App.tsx')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('creates dts with tuple literal permissions', () => {
    const dts = createDts(['user.delete', 'user.create'])

    expect(dts).toContain(
      'export declare const permissionKeys: readonly ["user.create", "user.delete"]'
    )
    expect(dts).toContain('export type PermissionManifest = {')
  })
})
