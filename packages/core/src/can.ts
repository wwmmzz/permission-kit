export type PermissionKey = string

export type PermissionChecker = {
  can: (permission: PermissionKey) => boolean
  canAny: (permissions: readonly PermissionKey[]) => boolean
  canAll: (permissions: readonly PermissionKey[]) => boolean
}

export function createPermissionChecker(
  permissions: readonly PermissionKey[]
): PermissionChecker {
  const permissionSet = new Set(permissions)

  return {
    can(permission) {
      return permissionSet.has(permission)
    },

    canAny(items) {
      return items.some((item) => permissionSet.has(item))
    },

    canAll(items) {
      return items.every((item) => permissionSet.has(item))
    }
  }
}
