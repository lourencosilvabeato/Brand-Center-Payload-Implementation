import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const ChannelPages: CollectionConfig = {
  slug: 'channelPages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL segment for this page (e.g. "brand-identity" for /brand-identity/).',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'buttons',
      type: 'array',
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
    {
      name: 'cards',
      type: 'array',
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
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAuthenticated,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
