import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPermissionPlugin, setupPermissionRouterGuard } from '@eycraf/permission-kit-vue'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import UserView from './views/UserView.vue'
import AdminView from './views/AdminView.vue'
import ForbiddenView from './views/ForbiddenView.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
})

const permissionPlugin = createPermissionPlugin({
  permissions: ['user.view', 'user.create']
})

const app = createApp(App)

app.use(permissionPlugin)
app.use(router)

setupPermissionRouterGuard(router, permissionPlugin.context, {
  fallback: '/403'
})

app.mount('#app')
