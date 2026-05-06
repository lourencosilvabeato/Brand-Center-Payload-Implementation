import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin } from '../access'

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    useAsTitle: 'email',
    group: 'Auth',
    defaultColumns: ['email', 'used', 'expiresAt', 'createdAt'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'tokenHash',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'SHA-256 hash of the raw invite token — never store the raw token.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'used',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'cancelled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'platformUsers',
      required: true,
    },
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAdminOrLocalAdmin,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
