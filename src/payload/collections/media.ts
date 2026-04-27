import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Media',
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: () => true,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
