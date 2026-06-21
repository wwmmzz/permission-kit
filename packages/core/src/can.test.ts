import { describe, expect, it } from 'vitest'
import { createPermissionChecker } from './can'

describe('createPermissionChecker', () => {
  it('checks permissions with any and all semantics', () => {
    const checker = createPermissionChecker(['user.read', 'user.write'])

    expect(checker.can('user.read')).toBe(true)
    expect(checker.can('user.delete')).toBe(false)
    expect(checker.canAny(['user.delete', 'user.write'])).toBe(true)
    expect(checker.canAny(['user.delete', 'user.export'])).toBe(false)
    expect(checker.canAll(['user.read', 'user.write'])).toBe(true)
    expect(checker.canAll(['user.read', 'user.delete'])).toBe(false)
  })
})
