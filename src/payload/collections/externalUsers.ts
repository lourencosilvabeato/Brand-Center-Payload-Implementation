import type { CollectionConfig, FieldAccess } from 'payload'
import type { Navigation } from '@/payload-types'
import { isAdmin, isAdminOrLocalAdmin } from '../access'
import { expandSlugsWithAncestors } from '@/lib/navigation'

const isAdminField: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return (user as unknown as { role?: string }).role === 'admin'
}

export const ExternalUsers: CollectionConfig = {
  slug: 'externalUsers',
  admin: {
    useAsTitle: 'email',
    group: 'Users',
    components: {
      edit: {
        beforeDocumentControls: [
          '@/payload/components/AdminResetPasswordButton#AdminResetPasswordButton',
        ],
      },
    },
  },
  auth: true,
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // When customRole is explicitly set or cleared, sync allowedMenuItems from the new role
        if (!('customRole' in data)) return data

        const roleId = data.customRole ? Number(data.customRole) : null
        if (roleId) {
          const [role, nav] = await Promise.all([
            req.payload.findByID({
              collection: 'customRoles',
              id: roleId,
              overrideAccess: true,
            }) as Promise<{ allowedMenuItems?: unknown }>,
            req.payload.findGlobal({ slug: 'navigation', depth: 1, overrideAccess: true }) as Promise<Navigation>,
          ])
          const rawSlugs = Array.isArray(role.allowedMenuItems)
            ? (role.allowedMenuItems as string[])
            : []
          const expanded = expandSlugsWithAncestors(rawSlugs, nav.items)
          ;(data as Record<string, unknown>).allowedMenuItems = expanded.length > 0 ? expanded : null
        } else {
          ;(data as Record<string, unknown>).allowedMenuItems = null
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      saveToJWT: true,
      defaultValue: 'external',
      options: [{ label: 'External', value: 'external' }],
      admin: {
        description: 'External users always have the external role.',
      },
    },
    {
      name: 'customRole',
      type: 'relationship',
      relationTo: 'customRoles',
      saveToJWT: true,
      admin: {
        description:
          'Optional custom role for granular page access. If set, restricts visible pages to those configured in the Role Permissions view.',
        condition: (_, __, { user }) =>
          (user as { role?: string } | null)?.role === 'admin',
      },
      access: {
        create: isAdminField,
        update: isAdminField,
      },
    },
    {
      name: 'allowedMenuItems',
      type: 'json',
      saveToJWT: true,
      admin: {
        hidden: true,
        description:
          'Denormalised cache of allowedMenuItems from the assigned customRole. Managed automatically — do not edit directly.',
      },
    },
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAdminOrLocalAdmin,
    update: isAdminOrLocalAdmin,
    delete: isAdmin,
  },
}
