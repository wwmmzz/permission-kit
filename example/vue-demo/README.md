# Vue Demo

这个 demo 用于测试 `@eycraf/permission-kit-vue`：

- `<Can />` 组件权限
- `v-permission` 指令权限
- `usePermission()` 组合式 API
- Vue Router `meta.permission` 路由权限

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
