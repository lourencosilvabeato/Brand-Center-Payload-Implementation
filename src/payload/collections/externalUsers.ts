import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrLocalAdmin, isAuthenticated } from '../access'

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
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAdminOrLocalAdmin,
    update: isAdminOrLocalAdmin,
    delete: isAdmin,
  },
}
