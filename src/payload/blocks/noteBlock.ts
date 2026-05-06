import type { Block } from 'payload'

export const NoteBlock: Block = {
  slug: 'noteBlock',
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
      ],
    },
  ],
}
