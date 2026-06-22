# Vue Demo

这个 demo 用于测试 `@eycraf/permission-kit-vue`：

- `<Can />` 组件权限
- `v-permission` 指令权限
- `usePermission()` 组合式 API
- Vue Router `meta.permission` 路由权限
- `grantPermissions()` / `revokePermissions()` / `togglePermission()` / `clearPermissions()` 权限操作

## 使用

在 monorepo 根目录执行：

```bash
pnpm install
pnpm --filter vue-demo dev
```

默认端口：

```txt
http://localhost:5174/
```

## 注意

`vite.config.ts` 里通过 alias 指向：

```txt
../../packages/core/src
../../packages/vue/src
```

所以本地开发时不需要先 build `core` 和 `vue` 包。

## 交互说明

- 顶部“授予 / 撤销 / 重置”按钮直接调用新的 `PermissionContext` API。
- `/admin` 路由会在没有 `system.admin` 时跳转到 `/403`。
- 当权限状态变化时，页面上的 `v-permission` 和 `Can` 会同步更新。
