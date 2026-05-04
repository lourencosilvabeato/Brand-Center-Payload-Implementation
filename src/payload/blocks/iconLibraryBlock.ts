import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const IconLibraryBlock: Block = {
  slug: 'iconLibraryBlock',
  labels: {
    singular: 'Icon Library',
    plural: 'Icon Libraries',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'downloadFile',
      type: 'relationship',
      relationTo: 'protectedFiles',
      admin: {
        description: 'Optional. When set, a "Download all" button appears at the bottom.',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Icon name — also used as the search filter criterion.',
          },
        },
        {
          name: 'icon',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'iconFile',
          type: 'relationship',
          relationTo: 'protectedFiles',
          admin: {
            description: 'Optional. Activates a per-icon download button.',
          },
        },
        {
          name: 'tags',
          type: 'array',
          fields: [
            {
              name: 'tag',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
