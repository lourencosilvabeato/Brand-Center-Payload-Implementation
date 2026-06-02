import type { Block } from 'payload'
import { lexicalEditor, UnorderedListFeature, OrderedListFeature } from '@payloadcms/richtext-lexical'

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
        ],
      }),
      required: true,
    },
  ],
}
