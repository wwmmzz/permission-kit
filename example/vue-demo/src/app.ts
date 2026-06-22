import { createRouter, createWebHistory, type RouterHistory, type RouteRecordRaw } from 'vue-router'
import {
  createPermissionPlugin,
  setupPermissionRouterGuard,
  type PermissionContext
} from '@eycraf/permission-kit-vue'
import HomeView from './views/HomeView.vue'
import UserView from './views/UserView.vue'
import AdminView from './views/AdminView.vue'
import ForbiddenView from './views/ForbiddenView.vue'

export const demoInitialPermissions = ['user.view', 'user.create'] as const

export const demoRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/users',
    component: UserView,
    meta: {
      permission: 'user.view'
    }
  },
  {
    path: '/admin',
    component: AdminView,
    meta: {
      permission: 'system.admin'
    }
  },
  {
    path: '/403',
    component: ForbiddenView
  }
]

export function createDemoRouter(history: RouterHistory = createWebHistory()) {
  return createRouter({
    history,
    routes: demoRoutes
  })
}

export function createDemoPermissionPlugin() {
  return createPermissionPlugin({
    permissions: demoInitialPermissions
  })
}

export function setupDemoPermissionGuard(
  router: ReturnType<typeof createDemoRouter>,
  context: PermissionContext
) {
  setupPermissionRouterGuard(router, context, {
    fallback: '/403'
  })
}
