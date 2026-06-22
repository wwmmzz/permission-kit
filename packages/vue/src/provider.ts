import { computed, provide, ref, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { createPermissionChecker, type PermissionChecker } from '@eycraf/permission-kit-core'

export type PermissionInput = string | string[]

export type PermissionContext = {
  permissions: Ref<string[]>
  checker: ComputedRef<PermissionChecker>
  can: (permission: string) => boolean
  canAny: (permissions: string[]) => boolean
  canAll: (permissions: string[]) => boolean
  setPermissions: (permissions: string[]) => void
}

export const PermissionContextKey: InjectionKey<PermissionContext> = Symbol('PermissionContext')

export function normalizePermissionInput(input: PermissionInput): string[] {
  return Array.isArray(input) ? input : [input]
}

export function createPermissionContext(
  initialPermissions: readonly string[] = []
): PermissionContext {
  const permissions = ref<string[]>([...initialPermissions])

  const checker = computed(() => createPermissionChecker(permissions.value))

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
      permissions.value = [...nextPermissions]
    }
  }
}

export function providePermission(initialPermissions: readonly string[] = []): PermissionContext {
  const context = createPermissionContext(initialPermissions)
  provide(PermissionContextKey, context)
  return context
}
