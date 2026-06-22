import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'
import { createPermissionPlugin, setupPermissionRouterGuard } from '@eycraf/permission-kit-vue'

const EmptyView = defineComponent({
  name: 'EmptyView',
  setup() {
    return () => null
  }
})

const demoRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: EmptyView
  },
  {
    path: '/admin',
    component: EmptyView,
    meta: {
      permission: 'system.admin'
    }
  },
  {
    path: '/403',
    component: EmptyView
  }
]

describe('vue demo app wiring', () => {
  it('redirects forbidden routes to the 403 page', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: demoRoutes
    })
    const permissionPlugin = createPermissionPlugin({
      permissions: ['user.view']
    })

    setupPermissionRouterGuard(router, permissionPlugin.context, {
      fallback: '/403'
    })

    await router.push('/admin')

    expect(router.currentRoute.value.path).toBe('/403')
    expect(router.currentRoute.value.query.redirect).toBe('/admin')
  })

  it('allows routes when the permission is granted', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: demoRoutes
    })
    const permissionPlugin = createPermissionPlugin({
      permissions: ['system.admin']
    })

    setupPermissionRouterGuard(router, permissionPlugin.context, {
      fallback: '/403'
    })

    await router.push('/admin')

    expect(router.currentRoute.value.path).toBe('/admin')
  })
})
