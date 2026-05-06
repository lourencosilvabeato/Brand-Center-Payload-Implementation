import type { GlobalConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

export const HomePage: GlobalConfig = {
  slug: 'homePage',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'newInItems',
      type: 'array',
      admin: {
        description: '"New in" section items shown on the homepage.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'excerpt',
          type: 'textarea',
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'quickAccessItems',
      type: 'array',
      admin: {
        description: 'Quick access shortcuts shown on the homepage.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'helpButtons',
      type: 'array',
      admin: {
        description: 'Help/support buttons shown on the homepage.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  access: {
    read: isAuthenticated,
    update: isAdminOrLocalAdmin,
  },
}
