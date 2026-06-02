import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const ChannelPages: CollectionConfig = {
  slug: 'channelPages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.slug && data.title) {
          data.slug = toSlug(data.title)
        }
        return data
      },
    ],
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
        description:
          'URL segment for this page (e.g. "brand-identity"). Auto-generated from title if left empty.',
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
          name: 'page',
          type: 'relationship',
          relationTo: ['channelPages', 'contentPages'],
          admin: {
            description:
              'Pick an existing page. Takes priority over the custom URL below.',
          },
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description:
              'Custom URL (e.g. an external link). Used only when no page is selected above.',
          },
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
