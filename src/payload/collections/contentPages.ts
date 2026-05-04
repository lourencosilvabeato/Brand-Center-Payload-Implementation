import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'
import {
  RichTextBlock,
  ImageBlock,
  QuoteBlock,
  NoteBlock,
  TableBlock,
  GridBlock,
  CollectionCardBlock,
  DownloadBlock,
  DividerBlock,
  FaqBlock,
  SectionBlock,
  IconLibraryBlock,
} from '../blocks'

export const ContentPages: CollectionConfig = {
  slug: 'contentPages',
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
        description: 'URL segment for this page (e.g. "logo-usage" for /brand-identity/logo-usage/).',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        SectionBlock,
        RichTextBlock,
        ImageBlock,
        QuoteBlock,
        NoteBlock,
        TableBlock,
        GridBlock,
        CollectionCardBlock,
        DownloadBlock,
        DividerBlock,
        FaqBlock,
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
