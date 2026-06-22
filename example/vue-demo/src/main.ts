import { createApp } from 'vue'
import App from './App.vue'
import { createDemoPermissionPlugin, createDemoRouter, setupDemoPermissionGuard } from './app'
import './style.css'

const router = createDemoRouter()
const permissionPlugin = createDemoPermissionPlugin()

const app = createApp(App)

app.use(permissionPlugin)
app.use(router)

setupDemoPermissionGuard(router, permissionPlugin.context)

app.mount('#app')
