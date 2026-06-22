import { describe, expect, it } from 'vitest'
import { createPermissionContext, normalizePermissionInput } from './provider'

describe('permission provider', () => {
  it('normalizes readonly arrays', () => {
    expect(normalizePermissionInput(['user.read', 'user.write'] as const)).toEqual([
      'user.read',
      'user.write'
    ])
  })

  it('supports granting, revoking, toggling and clearing permissions', () => {
    const context = createPermissionContext(['user.read'])

    context.grantPermissions(['user.write', 'user.read'] as const)
    expect(context.permissions.value).toEqual(['user.read', 'user.write'])

    context.revokePermissions('user.read')
    expect(context.permissions.value).toEqual(['user.write'])

    expect(context.togglePermission('user.delete')).toBe(true)
    expect(context.permissions.value).toEqual(['user.write', 'user.delete'])

    expect(context.togglePermission('user.delete')).toBe(false)
    expect(context.permissions.value).toEqual(['user.write'])

    context.clearPermissions()
    expect(context.permissions.value).toEqual([])
  })
})
