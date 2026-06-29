/**
 * Test script: directly verify Payload can find and authenticate the admin user.
 * Run with: node scripts/test-auth.mjs
 */
import crypto from 'crypto'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('./node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs')

const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgres://postgres:PayloadBrandCenter@127.0.0.1:5432/payload-brand-center',
})

async function pbkdf2(password, salt) {
  return new Promise((resolve, reject) =>
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (e, h) =>
      e ? reject(e) : resolve(h),
    ),
  )
}

const EMAIL = 'screenshot-admin@brandcenter.dev'
const PASSWORD = 'Screenshot123!'

// 1. Query the user from DB directly
const { rows } = await pool.query(
  'SELECT id, email, role, length(salt) as salt_len, length(hash) as hash_len, salt, hash, login_attempts, lock_until FROM platform_users WHERE email = $1',
  [EMAIL],
)

if (rows.length === 0) {
  console.log('ERROR: user not found in DB')
  process.exit(1)
}

const user = rows[0]
console.log('User found:', {
  id: user.id,
  email: user.email,
  role: user.role,
  salt_len: user.salt_len,
  hash_len: user.hash_len,
  login_attempts: user.login_attempts,
  lock_until: user.lock_until,
})

// 2. Verify hash
const hashBuffer = await pbkdf2(PASSWORD, user.salt)
const storedBuffer = Buffer.from(user.hash, 'hex')
const match =
  hashBuffer.length === storedBuffer.length &&
  crypto.timingSafeEqual(hashBuffer, storedBuffer)

console.log('Hash match:', match)

await pool.end()
