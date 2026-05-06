import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  displayName: 'Test Admin',
  role: 'admin' as const,
}

export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'platformUsers',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  await payload.create({
    collection: 'platformUsers',
    data: testUser,
  })
}

export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'platformUsers',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
