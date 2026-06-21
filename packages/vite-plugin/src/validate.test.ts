import { describe, expect, it, vi } from 'vitest'
import { resolveOptions } from './options'
import { validatePermissionUsages } from './validate'

describe('validatePermissionUsages', () => {
  it('warns with file and component context for unknown permissions', () => {
    const reporter = { warn: vi.fn() }
    const options = resolveOptions({
      validate: {
        enabled: true,
        permissions: ['user.read'],
        unknownPermission: 'warn'
      }
    })

    const unknown = validatePermissionUsages(
      [
        {
          permission: 'user.delete',
          file: 'src/App.tsx',
          line: 3,
          column: 5,
          component: 'Can'
        }
      ],
      options.validate,
      reporter
    )

    expect(unknown).toEqual(['user.delete'])
    expect(reporter.warn).toHaveBeenCalledTimes(1)
    expect(reporter.warn).toHaveBeenCalledWith(
      expect.stringContaining('user.delete (src/App.tsx:3:5, component=Can)')
    )
  })

  it('throws when unknown permissions are configured as errors', () => {
    const options = resolveOptions({
      validate: {
        enabled: true,
        permissions: ['user.read'],
        unknownPermission: 'error'
      }
    })

    expect(() =>
      validatePermissionUsages(
        [
          {
            permission: 'user.delete',
            file: 'src/App.tsx'
          }
        ],
        options.validate
      )
    ).toThrow('[vite-plugin-permission] Unknown permissions: user.delete')
  })
})
