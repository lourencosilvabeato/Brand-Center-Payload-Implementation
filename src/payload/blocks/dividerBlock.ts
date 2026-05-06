import type { Block } from 'payload'

export const DividerBlock: Block = {
  slug: 'dividerBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'short',
      options: [
        { label: 'Short (centred)', value: 'short' },
        { label: 'Long (full width)', value: 'long' },
      ],
    },
  ],
}
