# Repository Guidelines

## 项目结构与模块组织

这是一个基于 `pnpm` 的 monorepo。

- `packages/core`：与框架无关的权限逻辑和 Zod schema 工具。
- `packages/react`：React 绑定、Provider、Hook 以及 JSX 属性增强。
- `packages/vite-plugin`：用于权限相关转换与校验的 Vite 插件。
- `example/react-demo`：用于演示各个包的本地示例应用。
- `config/tsconfig`：Node 与 React 包共享的 TypeScript 基础配置。
- `.changeset`：发布说明和版本管理元数据。

各包源码放在对应的 `src/` 目录下。构建产物输出到 `dist/`，不要提交到仓库。

## 构建、测试与开发命令

请在仓库根目录使用 `pnpm`。

- `pnpm build`：通过 Turbo 运行所有包的构建任务。
- `pnpm lint`：运行所有包和示例应用的 ESLint。
- `pnpm typecheck`：执行整个工作区的 TypeScript 检查。
- `pnpm test`：通过 Turbo/Vitest 运行测试套件。
- `pnpm test:types`：通过 Turbo 和 `tsd` 运行公开 API 类型测试。
- `pnpm check:publish`：运行包发布结构和类型兼容性检查。
- `pnpm verify`：顺序执行 lint、typecheck、test、type tests、build 和发布检查。
- `pnpm format`：使用 Prettier 格式化仓库。
- `pnpm dev`：在有对应脚本时启动各包的 `dev` 任务。

## 代码风格与命名规范

使用开启 `strict` 的 TypeScript。代码格式由 Prettier 统一，静态检查由根目录的 Flat ESLint 配置负责。

- 缩进：2 个空格。
- 引号：格式化后的文件使用单引号。
- 文件命名：React 组件使用 `PascalCase.tsx`，例如 `PermissionProvider.tsx`；工具函数使用 `camelCase.ts`。
- 包级 API 尽量使用命名导出。

## 测试规范

测试框架是 Vitest。测试文件建议放在被测代码附近，或放在包内 `src/` 树下，并使用 `*.test.ts` / `*.test.tsx` 命名。

- 运行 `pnpm test` 检查整个工作区。
- 涉及 API 或类型变更时，在提交 PR 前运行 `pnpm typecheck`。

## 提交与 Pull Request 规范

当前提交历史很少，建议使用简短、祈使语气的提交信息，例如 `fix react lint` 或 `add vite plugin validation`。

发起 PR 时请包含：

- 变更说明和受影响的包。
- 相关 issue 或后续工作链接。
- 如果修改了 React 示例，附截图或简短演示说明。
- 若涉及发布内容，说明是否需要更新 `.changeset/`。

发布节奏按阶段推进，阶段结束即可发布；版本类型根据变更性质决定：

- 新增能力优先使用 `minor`。
- 修复、测试、文档和配置整理优先使用 `patch`。
- 只有破坏性变更才考虑 `major`。
- 每个阶段的改动应尽量保持可独立发布，不要依赖下一阶段才能成立。

## Agent 专用说明

不要覆盖已有的贡献文档。修改共享配置时，保持改动范围尽量小，并用 `pnpm lint` 和 `pnpm typecheck` 做验证。
