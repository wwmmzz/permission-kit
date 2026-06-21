// src/options.ts
import { z } from 'zod'

const FilterPatternSchema = z.custom<string | RegExp | Array<string | RegExp>>()

const GlobPatternSchema = z.union([z.string(), z.array(z.string())])

export const PluginOptionsSchema = z.object({
  framework: z.enum(['react', 'vue']).default('react'),

  componentName: z.string().default('Can'),

  importFrom: z.string().default('@your-org/permission-react'),

  /**
   * 全局 include/exclude。
   * transform/rewrite 没单独配置时，会回退使用这里。
   */
  include: FilterPatternSchema.optional(),
  exclude: FilterPatternSchema.optional(),

  transform: z
    .object({
      enabled: z.boolean().default(true),
      include: FilterPatternSchema.optional(),
      exclude: FilterPatternSchema.optional(),
      attributes: z.array(z.string()).default(['permission']),
      modeAttribute: z.string().default('permissionMode'),
      strategyAttribute: z.string().default('permissionStrategy'),
      allowNested: z.boolean().default(false)
    })
    .default({}),

  rewrite: z
    .object({
      enabled: z.boolean().default(false),

      /**
       * false = dry-run，只打印会修改哪些文件
       * true = 真实写回源文件
       */
      write: z.boolean().default(false),

      include: GlobPatternSchema.optional(),
      exclude: GlobPatternSchema.optional(),

      /**
       * rewrite 只在 serve/build 启动时跑一次。
       * 默认 true，避免 HMR 时反复改文件。
       */
      once: z.boolean().default(true)
    })
    .default({}),

  manifest: z
    .object({
      enabled: z.boolean().default(true),
      output: z.string().default('src/generated/permission-manifest.json')
    })
    .default({}),

  dts: z
    .object({
      enabled: z.boolean().default(true),
      output: z.string().default('src/generated/permission.d.ts'),
      typeName: z.string().default('PermissionKey')
    })
    .default({}),

  validate: z
    .object({
      enabled: z.boolean().default(false),
      permissions: z.array(z.string()).default([]),
      unknownPermission: z.enum(['off', 'warn', 'error']).default('warn')
    })
    .default({})
})

export type PermissionPluginOptions = z.input<typeof PluginOptionsSchema>
export type NormalizedPermissionPluginOptions = z.output<typeof PluginOptionsSchema>

export function resolveOptions(options: PermissionPluginOptions) {
  return PluginOptionsSchema.parse(options)
}
