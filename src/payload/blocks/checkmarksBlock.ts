import type { Block } from 'payload'

export const CheckmarksBlock: Block = {
  slug: 'checkmarksBlock',
  labels: {
    singular: 'Checkmarks List',
    plural: 'Checkmarks Lists',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Item', plural: 'Items' },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
