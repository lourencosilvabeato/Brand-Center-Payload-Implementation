import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CollectionCardBlock: Block = {
  slug: 'collectionCardBlock',
  labels: {
    singular: 'Collection',
    plural: 'Collections',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Optional small label displayed above the collection title.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
    },
    {
      name: 'cardModel',
      type: 'select',
      required: true,
      defaultValue: 'large',
      options: [
        { label: 'Large', value: 'large' },
        { label: 'Small', value: 'small' },
      ],
    },
    {
      name: 'assets',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor(),
        },
      ],
    },
    {
      name: 'downloadFile',
      type: 'relationship',
      relationTo: 'protectedFiles',
      admin: {
        description: 'Optional. When set, a "Download collection" button appears at the bottom.',
      },
    },
  ],
}
