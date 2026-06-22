export { Can } from './Can'
export type { PermissionMode, PermissionStrategy } from './Can'

export {
  PermissionContextKey,
  createPermissionContext,
  normalizePermissionInput,
  providePermission
} from './provider'
export type { PermissionContext, PermissionInput } from './provider'

export { usePermission } from './usePermission'

export { permissionDirective } from './directive'
export type { PermissionDirectiveValue } from './directive'

export { createPermissionPlugin, installPermission } from './plugin'
export type { PermissionVuePluginOptions } from './plugin'
export { setupPermissionRouterGuard } from './router'
export type { PermissionRouterGuardOptions } from './router'
