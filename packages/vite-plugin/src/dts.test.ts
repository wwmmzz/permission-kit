import { describe, expect, it } from 'vitest'
import { createDts } from './dts'

describe('createDts', () => {
  it('generates a tuple-based key list and helper manifest types', () => {
    const dts = createDts(['user.delete', 'user.create', 'user.create'])

    expect(dts).toContain(
      'export declare const permissionKeys: readonly ["user.create", "user.delete"]'
    )
    expect(dts).toContain('export type PermissionKey = typeof permissionKeys[number]')
    expect(dts).toContain('export type PermissionManifest = {')
    expect(dts).toContain('component?: string')
  })

  it('falls back to string when no permissions are known yet', () => {
    const dts = createDts([])

    expect(dts).toContain('export declare const permissionKeys: readonly string[]')
    expect(dts).toContain('export type PermissionKey = typeof permissionKeys[number]')
  })
})
