import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

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
        // Propagate allowedMenuItems to every externalUser assigned this role
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
              data: { allowedMenuItems: (doc.allowedMenuItems ?? null) as null },
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
          'Array of page slugs this role can access. Managed via the Role Permissions view. Empty or null means unrestricted.',
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
