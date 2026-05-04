import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const SectionBlock: Block = {
  slug: 'sectionBlock',
  labels: {
    singular: 'Section / Anchor',
    plural: 'Sections / Anchors',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Optional small label displayed above the section title.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Section heading (H2). Also used as the anchor bar label.',
      },
    },
    {
      name: 'anchorName',
      type: 'text',
      admin: {
        description: 'Anchor ID for this section (optional — defaults to the title if left empty). No spaces or special characters.',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Fill either URL or File, not both.' },
        },
        {
          name: 'file',
          type: 'relationship',
          relationTo: 'protectedFiles',
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
    },
  ],
}
