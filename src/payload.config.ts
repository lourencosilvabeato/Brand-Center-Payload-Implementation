import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { PlatformUsers } from './payload/collections/platformUsers'
import { ExternalUsers } from './payload/collections/externalUsers'
import { CustomRoles } from './payload/collections/customRoles'
import { Invitations } from './payload/collections/invitations'
import { PasswordResets } from './payload/collections/passwordResets'
import { ChannelPages } from './payload/collections/channelPages'
import { ContentPages } from './payload/collections/contentPages'
import { LegalPages } from './payload/collections/legalPages'
import { Media } from './payload/collections/media'
import { MediaFolders } from './payload/collections/mediaFolders'
import { ProtectedFiles } from './payload/collections/protectedFiles'

import { HomePage } from './payload/globals/homePage'
import { Navigation } from './payload/globals/navigation'
import { FooterSettings } from './payload/globals/footerSettings'
import { LoginSettings } from './payload/globals/loginSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: PlatformUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        rolePermissions: {
          Component: '@/payload/views/RolePermissionsView#RolePermissionsView',
          path: '/role-permissions',
        },
      },
      afterNavLinks: [
        '@/payload/components/RolePermissionsNavLink#RolePermissionsNavLink',
      ],
    },
  },
  collections: [
    PlatformUsers,
    ExternalUsers,
    CustomRoles,
    Invitations,
    PasswordResets,
    ChannelPages,
    ContentPages,
    LegalPages,
    Media,
    MediaFolders,
    ProtectedFiles,
  ],
  globals: [HomePage, Navigation, FooterSettings, LoginSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
