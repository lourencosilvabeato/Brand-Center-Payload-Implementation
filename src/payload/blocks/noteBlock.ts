import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const NoteBlock: Block = {
  slug: 'noteBlock',
  fields: [
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
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
    },
  ],
}
