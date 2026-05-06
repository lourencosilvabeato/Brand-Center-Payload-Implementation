import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrLocalAdmin } from '../access'

export const PlatformUsers: CollectionConfig = {
  slug: 'platformUsers',
  admin: {
    useAsTitle: 'email',
    group: 'Users',
  },
  auth: {
    disableLocalStrategy: true,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      saveToJWT: true,
      defaultValue: 'internal',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Local Admin', value: 'localAdmin' },
        { label: 'Internal', value: 'internal' },
      ],
    },
    {
      name: 'azureId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Azure AD object ID — populated automatically on first SSO login.',
      },
    },
    {
      name: 'avatarUrl',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Profile photo URL from Microsoft Graph — updated on each SSO login.',
      },
    },
  ],
  access: {
    create: isAdmin,
    read: isAdminOrLocalAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
