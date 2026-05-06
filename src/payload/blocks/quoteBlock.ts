import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quoteBlock',
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
    },
  ],
}
