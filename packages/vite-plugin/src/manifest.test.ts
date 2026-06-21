import { describe, expect, it } from 'vitest'
import { createManifest } from './manifest'
import { PermissionState } from './state'

describe('createManifest', () => {
  it('groups usages by permission and includes summary metadata', () => {
    const state = new PermissionState()
    state.setFileUsage('src/b.tsx', [
      {
        permission: 'user.delete',
        file: 'src/b.tsx',
        line: 12,
        column: 3,
        component: 'Can'
      }
    ])
    state.setFileUsage('src/a.tsx', [
      {
        permission: 'user.create',
        file: 'src/a.tsx',
        line: 4,
        column: 7,
        component: 'Can'
      },
      {
        permission: 'user.delete',
        file: 'src/a.tsx',
        line: 8,
        column: 5,
        component: 'Can'
      }
    ])

    const manifest = createManifest(state)

    expect(manifest.summary).toEqual({
      permissions: 2,
      usages: 3,
      files: 2
    })
    expect(manifest.permissions).toEqual([
      {
        permission: 'user.create',
        count: 1,
        files: ['src/a.tsx'],
        usages: [
          {
            file: 'src/a.tsx',
            line: 4,
            column: 7,
            component: 'Can'
          }
        ]
      },
      {
        permission: 'user.delete',
        count: 2,
        files: ['src/a.tsx', 'src/b.tsx'],
        usages: [
          {
            file: 'src/a.tsx',
            line: 8,
            column: 5,
            component: 'Can'
          },
          {
            file: 'src/b.tsx',
            line: 12,
            column: 3,
            component: 'Can'
          }
        ]
      }
    ])
  })
})
