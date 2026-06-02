import type { Block } from 'payload'

export const CrossesBlock: Block = {
  slug: 'crossesBlock',
  labels: {
    singular: 'Crosses List',
    plural: 'Crosses Lists',
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
