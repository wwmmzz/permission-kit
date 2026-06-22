import type { PermissionContext } from './provider'

export type PermissionRouterGuardOptions = {
  fallback?: string
  permissionKey?: string
}

type RouterLike = {
  beforeEach: (
    guard: (to: { meta?: Record<string, unknown>; fullPath: string }) => boolean | object | void
  ) => void
}

export function setupPermissionRouterGuard(
  router: RouterLike,
  context: PermissionContext,
  options: PermissionRouterGuardOptions = {}
) {
  const permissionKey = options.permissionKey ?? 'permission'

  router.beforeEach((to) => {
    const rawPermission = to.meta?.[permissionKey]

    if (!rawPermission) {
      return true
    }

    const permissions = getPermissionList(rawPermission)
    if (!permissions) {
      return true
    }

    const allowed =
      permissions.length > 1 ? context.canAll(permissions) : context.can(permissions[0]!)

    if (allowed) {
      return true
    }

    if (options.fallback) {
      return {
        path: options.fallback ?? '/403',
        query: {
          redirect: to.fullPath
        }
      }
    }

    return false
  })
}

function getPermissionList(value: unknown) {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value
  }

  return null
}
