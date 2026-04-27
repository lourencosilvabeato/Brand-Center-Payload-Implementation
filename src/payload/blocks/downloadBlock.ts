import type { Block } from 'payload'

export const DownloadBlock: Block = {
  slug: 'downloadBlock',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'file',
      type: 'relationship',
      relationTo: 'protectedFiles',
      required: true,
    },
  ],
}
