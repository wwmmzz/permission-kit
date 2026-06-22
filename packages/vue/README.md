# @eycraf/permission-kit-vue

Vue bindings for permission-kit.

## Install

```bash
pnpm add @eycraf/permission-kit-vue @eycraf/permission-kit-core
```

## Usage

```ts
import { createApp } from 'vue'
import { createPermissionPlugin } from '@eycraf/permission-kit-vue'
import App from './App.vue'

createApp(App)
  .use(
    createPermissionPlugin({
      permissions: ['user.view', 'user.create']
    })
  )
  .mount('#app')
```

```vue
<template>
  <Can permission="user.create">
    <button>新增用户</button>
  </Can>

  <button v-permission="'user.create'">新增用户</button>

  <button v-permission:disabled="'user.delete'">删除用户</button>

  <button v-permission:any="['user.update', 'user.delete']">操作</button>
</template>
```

## PermissionContext API

`usePermission()` 返回的上下文支持这些方法：

- `can(permission)`：判断单个权限。
- `canAny(permissions)`：至少命中一个权限时返回 `true`。
- `canAll(permissions)`：所有权限都命中时返回 `true`。
- `setPermissions(permissions)`：直接替换当前权限列表。
- `grantPermissions(permissions)`：追加权限，自动去重。
- `revokePermissions(permissions)`：移除指定权限。
- `togglePermission(permission)`：存在则移除，不存在则添加。
- `clearPermissions()`：清空权限列表。

示例：

```ts
const permission = usePermission()

permission.grantPermissions(['user.delete', 'system.admin'])
permission.revokePermissions('user.delete')
permission.togglePermission('user.export')
permission.clearPermissions()
```

## Notes

- `PermissionInput` 支持 `string` 和 `readonly string[]`。
- `v-permission:disabled` 会保留节点结构，并为可禁用元素设置 `disabled` / `aria-disabled`。
- `Can` 在 `disabled` 模式下会递归处理 `Fragment` 和嵌套子节点。
