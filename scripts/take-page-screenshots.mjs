import { chromium } from '@playwright/test'
import { createHash, createHmac } from 'crypto'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = 'docs/screenshots'
const PAYLOAD_SECRET = '00fed1fa819b6578bb2cca28'

// Replicate Payload's exact JWT signing logic (from src/lib/auth.ts)
function generateToken(userId, email, role, collection) {
  const signingKey = createHash('sha256').update(PAYLOAD_SECRET).digest('hex').slice(0, 32)

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payloadObj = {
    id: userId,
    email,
    role,
    collection,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200,
  }
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url')

  const sig = createHmac('sha256', Buffer.from(signingKey, 'utf8'))
    .update(`${header}.${payloadB64}`)
    .digest('base64url')

  return `${header}.${payloadB64}.${sig}`
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  // admin@brandcenter.dev — id=6, role=admin, collection=platformUsers
  const token = generateToken(6, 'admin@brandcenter.dev', 'admin', 'platformUsers')
  console.log('Token generated (first 40 chars):', token.slice(0, 40))

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })

  // Inject the auth cookie before any navigation
  await ctx.addCookies([{
    name: 'payload-token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
  }])

  const page = await ctx.newPage()

  // ── Channel page ──────────────────────────────────────────────
  console.log('[1] Channel page: /brand-principles')
  await page.goto(`${BASE_URL}/brand-principles`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3000)
  console.log('  URL after nav:', page.url())
  await page.screenshot({ path: `${OUT_DIR}/12-channel-page.png` })
  console.log('  ✓ 12-channel-page.png')

  // ── Content page ──────────────────────────────────────────────
  console.log('[2] Content page: /brand-principles/2nd-level-entry-1/3rd-level-entry-1')
  await page.goto(`${BASE_URL}/brand-principles/2nd-level-entry-1/3rd-level-entry-1`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3000)
  console.log('  URL after nav:', page.url())
  await page.screenshot({ path: `${OUT_DIR}/13-content-page.png` })
  console.log('  ✓ 13-content-page.png')

  // ── Search with results ───────────────────────────────────────
  console.log('[3] Search: /search?q=brand')
  await page.goto(`${BASE_URL}/search?q=brand`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3000)
  console.log('  URL after nav:', page.url())
  await page.screenshot({ path: `${OUT_DIR}/14-search-results.png` })
  console.log('  ✓ 14-search-results.png')

  // ── Frontend login page (unauthenticated context) ─────────────
  console.log('[4] Login page')
  const loginCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const loginPage = await loginCtx.newPage()
  await loginPage.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await loginPage.waitForTimeout(2000)
  await loginPage.screenshot({ path: `${OUT_DIR}/15-login-page.png` })
  console.log('  ✓ 15-login-page.png')
  await loginCtx.close()

  await ctx.close()
  await browser.close()
  console.log('\nDone — screenshots saved to', OUT_DIR)
}

main().catch(err => { console.error(err); process.exit(1) })
