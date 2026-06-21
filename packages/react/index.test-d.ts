import { expectType } from 'tsd'
import type { ComponentProps } from 'react'
import type { Can, PermissionProvider, usePermission} from './dist/index.js';
import { type CanProps } from './dist/index.js'
import type { PermissionChecker } from '../core/dist/index.js'

declare const buttonProps: ComponentProps<'button'>
declare const providerProps: ComponentProps<typeof PermissionProvider>
declare const canProps: CanProps
declare const checker: ReturnType<typeof usePermission>
declare const canComponent: typeof Can

expectType<string | readonly string[] | undefined>(buttonProps.permission)
expectType<readonly string[]>(providerProps.permissions)
expectType<PermissionChecker>(checker)
expectType<string | readonly string[]>(canProps.permission)
expectType<'any' | 'all' | undefined>(canProps.strategy)
expectType<'hidden' | 'disabled' | undefined>(canProps.mode)
expectType<CanProps>(canProps)
expectType<typeof Can>(canComponent)
