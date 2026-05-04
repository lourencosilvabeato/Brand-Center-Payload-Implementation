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
      ],
    },
    {
      name: 'downloadFile',
      type: 'relationship',
      relationTo: 'protectedFiles',
      admin: {
        description: 'Optional. Shows the download icon button.',
      },
    },
    {
      name: 'detailHref',
      type: 'text',
      admin: {
        description: 'URL of the collection detail page. Shows the ↗ link button.',
      },
    },
  ],
}
