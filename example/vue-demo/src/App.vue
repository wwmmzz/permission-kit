<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { usePermission } from '@eycraf/permission-kit-vue'

const permission = usePermission()

const permissionsText = computed(() => {
  return permission.permissions.value.join(', ') || '暂无权限'
})

function grantDeletePermission() {
  permission.grantPermissions('user.delete')
}

function grantAdminPermission() {
  permission.grantPermissions('system.admin')
}

function revokeDeletePermission() {
  permission.revokePermissions('user.delete')
}

function resetPermissions() {
  permission.clearPermissions()
  permission.grantPermissions(['user.view', 'user.create'])
}
</script>

<template>
  <main class="app-shell">
    <header class="header">
      <div>
        <h1>Permission Kit Vue Demo</h1>
        <p>当前权限：{{ permissionsText }}</p>
      </div>

      <div class="actions">
        <button type="button" @click="grantDeletePermission">
          授予 user.delete
        </button>
        <button type="button" @click="grantAdminPermission">
          授予 system.admin
        </button>
        <button type="button" @click="revokeDeletePermission">
          撤销 user.delete
        </button>
        <button type="button" @click="resetPermissions">
          重置权限
        </button>
      </div>
    </header>

    <nav class="nav">
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/users">用户页</RouterLink>
      <RouterLink to="/admin">管理员页</RouterLink>
    </nav>

    <section class="card">
      <RouterView />
    </section>
  </main>
</template>
