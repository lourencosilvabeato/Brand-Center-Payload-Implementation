import type { GlobalConfig } from 'payload'
import { isAdminOrLocalAdmin } from '../access'

export const LoginSettings: GlobalConfig = {
  slug: 'loginSettings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Main heading shown above the login form.',
      },
    },
    {
      name: 'introduction',
      type: 'textarea',
      admin: {
        description: 'Optional introductory paragraph shown below the title.',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Optional secondary text shown below the introduction.',
      },
    },
    {
      name: 'institutionalLinkLabel',
      type: 'text',
      admin: {
        description: 'Label for the institutional link (e.g. "Visit ascendum.com").',
      },
    },
    {
      name: 'institutionalLinkUrl',
      type: 'text',
      admin: {
        description: 'URL for the institutional link. Opens in a new tab.',
      },
    },
  ],
  access: {
    read: () => true,
    update: isAdminOrLocalAdmin,
  },
}
