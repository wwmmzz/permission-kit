import { describe, expectTypeOf, it } from 'vitest'
import { PluginOptionsSchema, resolveOptions } from './options'

describe('vite plugin option types', () => {
  it('preserves normalized option shapes', () => {
    const resolved = resolveOptions({})
    const parsed = PluginOptionsSchema.parse({})

    expectTypeOf(resolved.framework).toEqualTypeOf<'react' | 'vue'>()
    expectTypeOf(resolved.transform.enabled).toEqualTypeOf<boolean>()
    expectTypeOf(resolved.validate.unknownPermission).toEqualTypeOf<'off' | 'warn' | 'error'>()
    expectTypeOf(parsed).toEqualTypeOf(resolved)
  })
})
