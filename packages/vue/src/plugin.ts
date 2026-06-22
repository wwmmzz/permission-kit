import type { App } from 'vue'
import { Can } from './Can'
import { permissionDirective } from './directive'
import { createPermissionContext, PermissionContextKey, type PermissionContext } from './provider'

export type PermissionVuePluginOptions = {
  permissions?: readonly string[]
  componentName?: string
  directiveName?: string
}

export function createPermissionPlugin(options: PermissionVuePluginOptions = {}) {
  const context = createPermissionContext(options.permissions ?? [])

  return {
    context,
    install(app: App) {
      app.provide(PermissionContextKey, context)
      app.component(options.componentName ?? 'Can', Can)
      app.directive(options.directiveName ?? 'permission', permissionDirective)
    }
  }
}

export function installPermission(
  app: App,
  options: PermissionVuePluginOptions = {}
): PermissionContext {
  const context = createPermissionContext(options.permissions ?? [])

  app.provide(PermissionContextKey, context)
  app.component(options.componentName ?? 'Can', Can)
  app.directive(options.directiveName ?? 'permission', permissionDirective)

  return context
}
