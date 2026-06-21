import { expectType } from 'tsd'
import {
  createPermissionChecker,
  type PermissionChecker,
  type PermissionKey,
  type UserPermission
} from './dist/index.js'

declare const checker: PermissionChecker
declare const userPermission: UserPermission

expectType<PermissionChecker>(createPermissionChecker(['user.read']))
expectType<(permission: PermissionKey) => boolean>(checker.can)
expectType<(permissions: readonly PermissionKey[]) => boolean>(checker.canAny)
expectType<(permissions: readonly PermissionKey[]) => boolean>(checker.canAll)
expectType<string | undefined>(userPermission.userId)
expectType<string[]>(userPermission.roles)
expectType<string[]>(userPermission.permissions)
