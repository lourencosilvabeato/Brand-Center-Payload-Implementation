import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

import {
  RichTextBlock,
  QuoteBlock,
  NoteBlock,
  TableBlock,
  GridBlock,
  CollectionCardBlock,
  DividerBlock,
  SectionBlock,
  IconLibraryBlock,
  CheckmarksBlock,
  CrossesBlock,
} from '../blocks'

export const ContentPages: CollectionConfig = {
  slug: 'contentPages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.slug && data.title) {
          data.slug = toSlug(data.title)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL segment for this page (e.g. "logo-usage" for /brand-identity/logo-usage/).',
      },
    },
    {
      name: 'headerAnchorName',
      type: 'text',
      required: true,
      admin: {
        description: 'Anchor ID for the page title — used as the first entry in the anchor bar.',
      },
    },
    {
      name: 'excerpt',
      type: 'richText',
      editor: lexicalEditor(),
      admin: {
        description: 'Optional intro text displayed below the page title.',
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
      name: 'layout',
      type: 'blocks',
      blocks: [
        SectionBlock,
        RichTextBlock,
        CheckmarksBlock,
        CrossesBlock,
        QuoteBlock,
        NoteBlock,
        TableBlock,
        GridBlock,
        CollectionCardBlock,
        DividerBlock,
        IconLibraryBlock,
      ],
    },
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAuthenticated,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
