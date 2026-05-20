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
        // Propagate raw allowedMenuItems to every externalUser assigned this role.
        // Ancestor expansion happens on the fly in Header.tsx / page guards using
        // the navigation tree, so no nav fetch is needed here.
        const users = await req.payload.find({
          collection: 'externalUsers',
          where: { customRole: { equals: doc.id } },
          limit: 1000,
          overrideAccess: true,
        })
        if (users.docs.length === 0) return
        const value = Array.isArray(doc.allowedMenuItems) && doc.allowedMenuItems.length > 0
          ? doc.allowedMenuItems
          : null
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
    beforeDelete: [
      async ({ id, req }) => {
        // Clear customRole and allowedMenuItems from every user assigned to this role
        // BEFORE deletion so the FK constraint does not block the delete.
        const users = await req.payload.find({
          collection: 'externalUsers',
          where: { customRole: { equals: id } },
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
