import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

export const ProtectedFiles: CollectionConfig = {
  slug: 'protectedFiles',
  admin: {
    group: 'Media',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  upload: true,
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Display name shown to users when downloading.',
      },
    },
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAuthenticated,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
