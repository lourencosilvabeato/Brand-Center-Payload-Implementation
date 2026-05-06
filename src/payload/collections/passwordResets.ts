import type { CollectionConfig } from 'payload'
import { isAdminOrLocalAdmin } from '../access'

export const PasswordResets: CollectionConfig = {
  slug: 'passwordResets',
  admin: {
    useAsTitle: 'id',
    group: 'Auth',
    defaultColumns: ['user', 'used', 'expiresAt', 'createdAt'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'externalUsers',
      required: true,
    },
    {
      name: 'tokenHash',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'SHA-256 hash of the raw reset token — never store the raw token.',
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
  ],
  access: {
    create: isAdminOrLocalAdmin,
    read: isAdminOrLocalAdmin,
    update: isAdminOrLocalAdmin,
    delete: isAdminOrLocalAdmin,
  },
}
