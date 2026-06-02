import type { Block } from 'payload'
import { lexicalEditor, UnorderedListFeature, OrderedListFeature } from '@payloadcms/richtext-lexical'
import { ChecklistOptionsFeature } from '../lexical/ChecklistOptionsFeature'

export const RichTextBlock: Block = {
  slug: 'richText',
  fields: [
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          UnorderedListFeature(),
          OrderedListFeature(),
          ChecklistOptionsFeature(),
        ],
      }),
      required: true,
    },
  ],
}
