import type { Block } from 'payload'

export const CollectionCardBlock: Block = {
  slug: 'collectionCardBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
}
