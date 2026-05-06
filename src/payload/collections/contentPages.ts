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
      ],
    },
    {
      name: 'anchors',
      type: 'array',
      admin: {
        description: 'Anchor navigation links shown in the anchor bar above the content.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'anchor',
          type: 'text',
          required: true,
          admin: {
            description: 'The anchor ID to scroll to (without the # prefix).',
          },
        },
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
