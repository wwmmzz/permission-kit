import { computed, provide, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { createPermissionChecker, type PermissionChecker } from '@eycraf/permission-kit-core'

export type PermissionInput = string | readonly string[]

export type PermissionContext = {
  permissions: Ref<string[]>
  checker: ComputedRef<PermissionChecker>
  can: (permission: string) => boolean
  canAny: (permissions: readonly string[]) => boolean
  canAll: (permissions: readonly string[]) => boolean
  setPermissions: (permissions: readonly string[]) => void
  grantPermissions: (permissions: PermissionInput) => void
  revokePermissions: (permissions: PermissionInput) => void
  togglePermission: (permission: string) => boolean
  clearPermissions: () => void
}

export const PermissionContextKey: InjectionKey<PermissionContext> = Symbol('PermissionContext')

export function normalizePermissionInput(input: PermissionInput): string[] {
  if (isPermissionArray(input)) {
    return [...input]
  }

  return [input]
}

function isPermissionArray(input: PermissionInput): input is readonly string[] {
  return Array.isArray(input)
}

export function createPermissionContext(
  initialPermissions: readonly string[] = []
): PermissionContext {
  const permissions = ref<string[]>([...initialPermissions])

  const checker = computed(() => createPermissionChecker(permissions.value))

  function setPermissionList(nextPermissions: readonly string[]) {
    permissions.value = [...nextPermissions]
  }

  return {
    permissions,
    checker,

    can(permission) {
      return checker.value.can(permission)
    },

    canAny(items) {
      return checker.value.canAny(items)
    },

    canAll(items) {
      return checker.value.canAll(items)
    },

    setPermissions(nextPermissions) {
      setPermissionList(nextPermissions)
    },

    grantPermissions(nextPermissions) {
      const merged = new Set([...permissions.value, ...normalizePermissionInput(nextPermissions)])
      setPermissionList([...merged])
    },

    revokePermissions(nextPermissions) {
      const revoked = new Set(normalizePermissionInput(nextPermissions))
      setPermissionList(permissions.value.filter((permission) => !revoked.has(permission)))
    },

    togglePermission(permission) {
      const exists = permissions.value.includes(permission)

      if (exists) {
        setPermissionList(permissions.value.filter((item) => item !== permission))
        return false
      }

      setPermissionList([...permissions.value, permission])
      return true
    },

    clearPermissions() {
      setPermissionList([])
    }
  }
}

export function providePermission(initialPermissions: readonly string[] = []): PermissionContext {
  const context = createPermissionContext(initialPermissions)
  provide(PermissionContextKey, context)
  return context
}
