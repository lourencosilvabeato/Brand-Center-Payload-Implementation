import type { Block } from 'payload'

export const GridBlock: Block = {
  slug: 'gridBlock',
  fields: [
    {
      name: 'columns',
      type: 'select',
      required: true,
      defaultValue: '3',
      options: [
        { label: '1 column', value: '1' },
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
        { label: '6 columns', value: '6' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
  ],
}
