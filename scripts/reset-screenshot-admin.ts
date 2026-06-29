/**
 * Sets a known password on the screenshot-admin user so Playwright can log in.
 * Run once: npx tsx scripts/reset-screenshot-admin.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const EMAIL = 'screenshot-admin@brandcenter.dev'
const PASSWORD = 'Screenshot@1234'

async function main() {
  const payload = await getPayload({ config })

  // Find the user
  const result = await payload.find({
    collection: 'platformUsers',
    where: { email: { equals: EMAIL } },
    limit: 1,
  })

  if (result.docs.length === 0) {
    // Create if missing
    await payload.create({
      collection: 'platformUsers',
      data: { email: EMAIL, role: 'admin', password: PASSWORD } as never,
    })
    console.log(`Created ${EMAIL} with known password`)
  } else {
    // Update password
    await (payload as any).db.drizzle.execute(
      // Use Payload's own update with overrideAccess to bypass hooks
      'SELECT 1', // no-op — will use REST approach below
    )
    // Use Payload REST API internally to update password
    const id = result.docs[0]!.id
    await payload.update({
      collection: 'platformUsers',
      id,
      data: { password: PASSWORD } as never,
      overrideAccess: true,
    })
    console.log(`Updated password for ${EMAIL}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
