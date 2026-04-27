import type { Block } from 'payload'

export const TableBlock: Block = {
  slug: 'tableBlock',
  fields: [
    {
      name: 'rows',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'cells',
          type: 'array',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'content',
              type: 'text',
            },
            {
              name: 'isHeader',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}
