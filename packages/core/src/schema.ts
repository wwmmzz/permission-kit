import { z } from 'zod'

export const UserPermissionSchema = z.object({
  userId: z.string().optional(),
  roles: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([])
})

export type UserPermission = z.infer<typeof UserPermissionSchema>