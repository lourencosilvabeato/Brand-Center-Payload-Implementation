import type { Block } from 'payload'

export const CollectionCardBlock: Block = {
  slug: 'collectionCardBlock',
  labels: {
    singular: 'Collection',
    plural: 'Collections',
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
      admin: {
        description: 'URL-safe identifier. The detail page will be at /collection/[slug].',
      },
    },
    {
      name: 'cardModel',
      type: 'select',
      defaultValue: 'large',
      required: true,
      options: [
        { label: 'Large', value: 'large' },
        { label: 'Small', value: 'small' },
      ],
      admin: {
        description: 'Two consecutive Small cards render side-by-side on desktop.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Shown on the collection detail page.',
      },
    },
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Optional label shown below the images (e.g. "Logos").',
      },
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
          name: 'assetDescription',
          type: 'richText',
          admin: {
            description: 'Optional description shown below this asset on the detail page.',
          },
        },
      ],
    },
    {
      name: 'downloadFile',
      type: 'relationship',
      relationTo: 'protectedFiles',
      admin: {
        description: 'Optional. Shows the download icon button and sticky download bar on detail page.',
      },
    },
    {
      name: 'detailHref',
      type: 'text',
      admin: {
        description: 'Deprecated — use slug instead. Kept for backwards compatibility.',
      },
    },
  ],
}
