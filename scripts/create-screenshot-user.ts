/**
 * Creates a fresh admin user with a known password for screenshot automation.
 * Run: npx tsx scripts/create-screenshot-user.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const EMAIL = 'screenshots@brandcenter.dev'
const PASSWORD = 'Screenshots@2024'

async function main() {
  const payload = await getPayload({ config })

  // Delete if already exists
  const existing = await payload.find({
    collection: 'platformUsers',
    where: { email: { equals: EMAIL } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    await payload.delete({
      collection: 'platformUsers',
      id: existing.docs[0]!.id,
      overrideAccess: true,
    })
    console.log('Deleted existing user')
  }

  // Create fresh — Payload hashes the password internally
  await payload.create({
    collection: 'platformUsers',
    data: {
      email: EMAIL,
      password: PASSWORD,
      role: 'admin',
      displayName: 'Screenshot Bot',
    } as never,
    overrideAccess: true,
  })

  console.log(`Created ${EMAIL} / ${PASSWORD}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
