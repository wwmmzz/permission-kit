import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { describe, expect, it } from 'vitest'
import { resolveOptions } from './options'
import { rewriteSourceFiles } from './rewrite'

describe('rewriteSourceFiles', () => {
  it('reports changes without writing when rewrite.write is false', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'permission-kit-rewrite-'))

    try {
      await mkdir(path.join(root, 'src'), { recursive: true })
      await writeFile(
        path.join(root, 'src', 'App.tsx'),
        `const view = <button permission="user.create">Create</button>`,
        'utf-8'
      )

      const warnings: string[] = []
      const result = await rewriteSourceFiles(
        root,
        resolveOptions({
          framework: 'react',
          rewrite: {
            enabled: true,
            write: false,
            include: ['src/**/*.{tsx,jsx}']
          }
        }),
        {
          warn(message) {
            warnings.push(message)
          }
        }
      )

      expect(result.checked).toBe(1)
      expect(result.changed).toBe(1)
      expect(result.files[0]).toContain('App.tsx')
      expect(warnings[0]).toContain('rewrite dry-run')

      const content = await readFile(path.join(root, 'src', 'App.tsx'), 'utf-8')
      expect(content).toContain('permission="user.create"')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('writes transformed files when rewrite.write is true', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'permission-kit-rewrite-'))

    try {
      await mkdir(path.join(root, 'src'), { recursive: true })
      await writeFile(
        path.join(root, 'src', 'App.tsx'),
        `const view = <button permission="user.create">Create</button>`,
        'utf-8'
      )

      const result = await rewriteSourceFiles(
        root,
        resolveOptions({
          framework: 'react',
          rewrite: {
            enabled: true,
            write: true,
            include: ['src/**/*.{tsx,jsx}']
          }
        }),
        {
          warn() {}
        }
      )

      expect(result.changed).toBe(1)

      const content = await readFile(path.join(root, 'src', 'App.tsx'), 'utf-8')
      expect(content).toContain(`import { Can } from '@eycraf/permission-kit-react'`)
      expect(content).toContain('<Can permission={"user.create"}>')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
