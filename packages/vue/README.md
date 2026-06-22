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
