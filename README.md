# permission-kit

`permission-kit` 是一个基于 `pnpm` 的权限工具链，面向 React 项目提供运行时权限判断、构建期 JSX 转换和权限清单生成能力。

## 包结构

- `packages/core`：与框架无关的权限判断逻辑和 schema。
- `packages/react`：React `Provider`、`Can` 组件、`usePermission` Hook 和 JSX 属性增强。
- `packages/vite-plugin`：Vite 插件，负责权限转换、manifest、dts 和校验。
- `example/react-demo`：本地示例应用，用来演示完整使用流程。

## 安装

```bash
pnpm install
```

## 快速开始

### 运行时权限

```tsx
import { createPermissionChecker } from '@eycraf/permission-kit-core'
import { Can, PermissionProvider } from '@eycraf/permission-kit-react'

const checker = createPermissionChecker(['user.create', 'user.read'])

export function App() {
  if (checker.can('user.read')) {
    console.log('has read permission')
  }

  return (
    <PermissionProvider permissions={['user.create']}>
      <Can permission="user.create">
        <button>新增用户</button>
      </Can>
    </PermissionProvider>
  )
}
```

### Vite 插件

```ts
import { defineConfig } from 'vite'
import permissionPlugin from '@eycraf/permission-kit-vite-plugin'

export default defineConfig({
  plugins: [
    permissionPlugin({
      framework: 'react',
      validate: {
        enabled: true,
        permissions: ['user.create', 'user.delete']
      }
    })
  ]
})
```

插件会在构建期输出权限清单和类型声明，并可在开发期提供权限变更信息。

## 常用命令

- `pnpm lint`：运行全仓库 ESLint。
- `pnpm typecheck`：运行全仓库 TypeScript 检查。
- `pnpm test`：运行 Vitest 测试。
- `pnpm test:types`：运行公开 API 类型测试。
- `pnpm build`：构建所有包和示例。
- `pnpm verify`：顺序执行 lint、typecheck、test、type tests、build 和发布检查。
- `pnpm check:publish`：运行 `publint` 和 `attw`，检查包发布结构。

## 开发说明

- 仓库默认使用 `pnpm`，不要切回 `npm`。
- 生成文件会落在各包的 `dist/` 或 `src/generated/`，这些目录不应手工提交。
- 发布节奏按阶段推进，阶段结束即可发布；版本类型按变更性质选择，新增能力优先 `minor`，修复和文档类变更优先 `patch`。

## 示例

启动示例应用：

```bash
pnpm dev
```

或者单独运行 React demo：

```bash
pnpm --filter react-demo dev
```
