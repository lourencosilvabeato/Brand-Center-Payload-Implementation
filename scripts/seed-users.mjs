import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const users = [
  { email: 'admin@brandcenter.dev', password: 'Admin@1234', role: 'admin', displayName: 'Admin User' },
  { email: 'localadmin@brandcenter.dev', password: 'LocalAdmin@1234', role: 'localAdmin', displayName: 'Local Admin' },
  { email: 'internal@brandcenter.dev', password: 'Internal@1234', role: 'internal', displayName: 'Internal User' },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const user of users) {
    try {
      const existing = await payload.find({
        collection: 'platformUsers',
        where: { email: { equals: user.email } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'platformUsers',
          id: existing.docs[0].id,
          data: { password: user.password, role: user.role, displayName: user.displayName },
        })
        console.log(`Updated: ${user.email}`)
      } else {
        await payload.create({
          collection: 'platformUsers',
          data: {
            email: user.email,
            password: user.password,
            role: user.role,
            displayName: user.displayName,
          },
        })
        console.log(`Created: ${user.email}`)
      }
    } catch (e) {
      console.error(`Failed for ${user.email}:`, e.message)
    }
  }

  process.exit(0)
}

seed()
