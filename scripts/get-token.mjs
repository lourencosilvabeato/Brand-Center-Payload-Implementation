import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

// Use Payload's built-in login to get a proper signed token
const result = await payload.login({
  collection: 'platformUsers',
  data: { email: 'admin@brandcenter.dev', password: 'Admin@1234' },
})

console.log('TOKEN:' + result.token)
process.exit(0)
