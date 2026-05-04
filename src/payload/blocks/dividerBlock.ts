import type { Block } from 'payload'

export const DividerBlock: Block = {
  slug: 'dividerBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'long',
      options: [
        { label: 'Long (full width)', value: 'long' },
        { label: 'Short (centred)', value: 'short' },
      ],
    },
  ],
}
