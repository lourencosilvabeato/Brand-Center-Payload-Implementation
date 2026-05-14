import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin } from '../access'
import {
  RichTextBlock,
  QuoteBlock,
  NoteBlock,
  TableBlock,
  DividerBlock,
} from '../blocks'

export const LegalPages: CollectionConfig = {
  slug: 'legalPages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
        description: 'URL segment for this page (e.g. "privacy-policy").',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [RichTextBlock, QuoteBlock, NoteBlock, TableBlock, DividerBlock],
    },
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: () => true,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
