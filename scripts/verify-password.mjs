import crypto from 'crypto'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pg = require('./node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js')

const { Pool } = pg
const pool = new Pool({ connectionString: 'postgres://postgres:PayloadBrandCenter@127.0.0.1:5432/payload-brand-center' })

async function pbkdf2(password, salt) {
  return new Promise((resolve, reject) =>
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (e, h) => e ? reject(e) : resolve(h))
  )
}

const { rows } = await pool.query(
  'SELECT id, email, role, salt, hash, login_attempts, lock_until FROM platform_users WHERE email = $1',
  ['admin@brandcenter.dev']
)

if (!rows.length) { console.log('User not found'); process.exit(1) }

const user = rows[0]
console.log('User:', { id: user.id, email: user.email, role: user.role, login_attempts: user.login_attempts, lock_until: user.lock_until })
console.log('Has salt:', !!user.salt, '| Has hash:', !!user.hash)

const hashBuffer = await pbkdf2('Admin@1234', user.salt)
const storedBuffer = Buffer.from(user.hash, 'hex')
const match = hashBuffer.length === storedBuffer.length && crypto.timingSafeEqual(hashBuffer, storedBuffer)
console.log('Password match:', match)

await pool.end()
