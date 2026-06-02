import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

export const MediaFolders: CollectionConfig = {
  slug: 'mediaFolders',
  labels: {
    singular: 'Media Folder',
    plural: 'Media Folders',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Media',
    defaultColumns: ['name', 'parent', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'mediaFolders',
      admin: {
        description: 'Leave empty for a root-level folder.',
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
