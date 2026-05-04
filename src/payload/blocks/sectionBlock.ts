import type { Block } from 'payload'

export const SectionBlock: Block = {
  slug: 'sectionBlock',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Visible section heading and anchor bar label.',
      },
    },
    {
      name: 'anchorName',
      type: 'text',
      required: true,
      admin: {
        description: 'Anchor ID used in the URL hash (e.g. "colours"). No spaces or special characters.',
      },
    },
  ],
}
