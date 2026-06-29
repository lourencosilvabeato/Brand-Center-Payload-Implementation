import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

const result = await payload.find({
  collection: 'channelPages',
  where: { slug: { equals: 'brand-principles' } },
  limit: 1,
  overrideAccess: true,
})

console.log('channelPages result:', result.docs.length, result.docs[0]?.slug)

const nav = await payload.findGlobal({ slug: 'navigation', overrideAccess: true })
console.log('nav items:', nav?.items?.length)

process.exit(0)
