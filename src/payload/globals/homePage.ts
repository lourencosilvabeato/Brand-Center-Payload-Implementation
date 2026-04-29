import type { GlobalConfig } from 'payload'
import { isAdminOrLocalAdmin, isAuthenticated } from '../access'

export const HomePage: GlobalConfig = {
  slug: 'homePage',
  admin: {
    group: 'Settings',
  },
  fields: [
    // ── Hero ─────────────────────────────────────────────────────
    {
      name: 'heroImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'heroHeadline',
      type: 'text',
      required: true,
    },
    {
      name: 'heroIntroText',
      type: 'textarea',
      admin: {
        description: 'Optional intro text shown below the headline (desktop only).',
      },
    },
    // ── New In section ────────────────────────────────────────────
    {
      name: 'newInTitle',
      type: 'text',
      required: true,
      defaultValue: 'NEW IN',
    },
    {
      name: 'newInBody',
      type: 'textarea',
    },
    {
      name: 'newInItems',
      type: 'array',
      admin: {
        description: '"New in" section items. Recommended 4.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Open link in a new tab.',
          },
        },
      ],
    },
    // ── Quick Access section ──────────────────────────────────────
    {
      name: 'quickAccessTitle',
      type: 'text',
      required: true,
      defaultValue: 'QUICK ACCESS',
    },
    {
      name: 'quickAccessBody',
      type: 'textarea',
    },
    {
      name: 'quickAccessItems',
      type: 'array',
      admin: {
        description: 'Quick access shortcuts. Recommended 4.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Open link in a new tab.',
          },
        },
      ],
    },
    // ── Help buttons ──────────────────────────────────────────────
    {
      name: 'helpButtons',
      type: 'array',
      admin: {
        description: 'Help/support buttons shown at the bottom of the homepage. Recommended 3.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show this button on the homepage.',
          },
        },
      ],
    },
  ],
  access: {
    read: isAuthenticated,
    update: isAdminOrLocalAdmin,
  },
}
