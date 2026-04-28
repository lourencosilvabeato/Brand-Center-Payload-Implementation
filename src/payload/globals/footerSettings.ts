import type { GlobalConfig } from 'payload'
import { isAdminOrLocalAdmin } from '../access'

export const FooterSettings: GlobalConfig = {
  slug: 'footerSettings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'copyright',
      type: 'text',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'legalLinks',
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
          relationTo: 'legalPages',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Use this for external links instead of a legal page.',
          },
        },
      ],
    },
  ],
  access: {
    read: () => true,
    update: isAdminOrLocalAdmin,
  },
}
