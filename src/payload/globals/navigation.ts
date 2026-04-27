import type { GlobalConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      admin: {
        description: 'Top-level navigation items (L1). Each can have L2 children, each L2 can have L3 children.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: ['channelPages', 'contentPages'],
        },
        {
          name: 'children',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'page',
              type: 'relationship',
              relationTo: ['channelPages', 'contentPages'],
            },
            {
              name: 'children',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'page',
                  type: 'relationship',
                  relationTo: 'contentPages',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  access: {
    read: isAuthenticated,
    update: isAdminOrLocalAdmin,
  },
}
