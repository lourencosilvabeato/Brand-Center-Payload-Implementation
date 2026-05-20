import type { CollectionConfig } from 'payload'
import type { Navigation } from '@/payload-types'
import { isAdmin } from '../access'
import { expandSlugsWithAncestors } from '@/lib/navigation'

export const CustomRoles: CollectionConfig = {
  slug: 'customRoles',
  admin: {
    useAsTitle: 'name',
    group: 'Users',
    description:
      'Custom permission roles for external users. Use the Role Permissions view to configure page access.',
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Propagate allowedMenuItems (ancestor-expanded) to every externalUser assigned this role
        const [users, nav] = await Promise.all([
          req.payload.find({
            collection: 'externalUsers',
            where: { customRole: { equals: doc.id } },
            limit: 1000,
            overrideAccess: true,
          }),
          req.payload.findGlobal({ slug: 'navigation', depth: 1, overrideAccess: true }) as Promise<Navigation>,
        ])
        if (users.docs.length === 0) return
        const rawSlugs = Array.isArray(doc.allowedMenuItems)
          ? (doc.allowedMenuItems as string[])
          : []
        const expanded = expandSlugsWithAncestors(rawSlugs, nav.items)
        const value = expanded.length > 0 ? expanded : null
        await Promise.all(
          users.docs.map((user) =>
            req.payload.update({
              collection: 'externalUsers',
              id: user.id,
              data: { allowedMenuItems: value } as Record<string, unknown>,
              overrideAccess: true,
            }),
          ),
        )
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        // Clear customRole and allowedMenuItems from every user that had this role
        const users = await req.payload.find({
          collection: 'externalUsers',
          where: { customRole: { equals: doc.id } },
          limit: 1000,
          overrideAccess: true,
        })
        if (users.docs.length === 0) return
        await Promise.all(
          users.docs.map((user) =>
            req.payload.update({
              collection: 'externalUsers',
              id: user.id,
              data: { customRole: null, allowedMenuItems: null } as Record<string, unknown>,
              overrideAccess: true,
            }),
          ),
        )
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Display name for this role, e.g. "Agency Partner" or "Supplier".',
      },
    },
    {
      name: 'description',
      type: 'text',
      admin: {
        description: 'Optional internal note about this role.',
      },
    },
    {
      name: 'allowedMenuItems',
      type: 'json',
      admin: {
        description:
          'Select which pages this role can access. Leave everything unticked for unrestricted access.',
        components: {
          Field: '@/payload/components/AllowedMenuItemsField#AllowedMenuItemsField',
        },
      },
    },
  ],
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
