/**
 * Screenshot capture script for Brand Center README documentation.
 * Run with: node scripts/screenshots.mjs
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = 'docs/screenshots'
const ADMIN_EMAIL = 'screenshot-admin@brandcenter.dev'
const ADMIN_PASSWORD = 'Screenshot123!'

async function snap(page, name) {
  await page.screenshot({ path: `${OUT_DIR}/${name}.png` })
  console.log(`  ✓ ${name}.png`)
}

async function fillAdminForm(page, email, password, confirmPassword = null) {
  // Wait for at least one input to appear (React renders async)
  await page.waitForSelector('input', { timeout: 15000 })
  await page.waitForTimeout(500)

  // Fill email — try both Payload admin field ID patterns
  const emailSel = page.locator('#field-email, input[name="email"], input[type="email"]').first()
  await emailSel.fill(email)

  // Fill password
  const pwSel = page.locator('#field-password, input[name="password"]').first()
  await pwSel.fill(password)

  // Confirm password if present
  if (confirmPassword) {
    const confirmSel = page.locator('#field-confirm-password, input[name="confirm-password"]').first()
    const visible = await confirmSel.isVisible().catch(() => false)
    if (visible) await confirmSel.fill(confirmPassword)
  }

  await page.click('button[type="submit"]')
}

async function authenticate(page) {
  // Try create-first-user first (if no admin exists Payload shows this)
  await page.goto(`${BASE_URL}/admin/create-first-user`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1500)

  // If Payload redirected us to /admin/login, a user already exists
  if (page.url().includes('/login')) {
    console.log('  → Admin exists, logging in with known credentials')
    await page.waitForSelector('input', { timeout: 10000 })
    await fillAdminForm(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    await page.waitForURL(url => !url.href.includes('/login'), { timeout: 20000 })
    await page.waitForTimeout(1500)
    console.log('  ✓ Logged in →', page.url())
    return
  }

  // Still on create-first-user — create admin
  console.log('  → Creating first admin user')
  await fillAdminForm(page, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PASSWORD)

  // After creation Payload redirects to /admin
  try {
    await page.waitForURL(url => !url.href.includes('create-first-user'), { timeout: 20000 })
  } catch {
    // If redirect didn't happen, check for errors
    const bodyText = await page.locator('body').innerText().catch(() => '')
    console.log('  ! No redirect after creation. Body snippet:', bodyText.slice(0, 200))
  }
  await page.waitForTimeout(1500)
  console.log('  ✓ Created admin →', page.url())
}

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [err]', msg.text().slice(0, 120))
  })

  // ── 1. Admin login page (unauthenticated) ───────────────────────
  console.log('\n[1] Admin login page')
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('input', { timeout: 15000 }).catch(() => null)
  await page.waitForTimeout(1000)
  await snap(page, '01-admin-login')

  // ── 2. Authenticate ──────────────────────────────────────────────
  console.log('\n[2] Authenticating')
  try {
    await authenticate(page)
  } catch (err) {
    console.log('  ! Auth failed:', err.message, '— URL:', page.url())
    await snap(page, 'debug-auth')
  }

  // ── 3. Admin dashboard ──────────────────────────────────────────
  console.log('\n[3] Admin dashboard')
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2500)
  await snap(page, '02-admin-dashboard')

  // ── 4. Content pages ────────────────────────────────────────────
  console.log('\n[4] Content pages collection')
  await page.goto(`${BASE_URL}/admin/collections/contentPages`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)
  await snap(page, '03-admin-content-pages')

  // ── 5. Channel pages ────────────────────────────────────────────
  console.log('\n[5] Channel pages collection')
  await page.goto(`${BASE_URL}/admin/collections/channelPages`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)
  await snap(page, '04-admin-channel-pages')

  // ── 6. Navigation global ─────────────────────────────────────────
  console.log('\n[6] Navigation global')
  await page.goto(`${BASE_URL}/admin/globals/navigation`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)
  await snap(page, '05-admin-navigation')

  // ── 7. Platform users ────────────────────────────────────────────
  console.log('\n[7] Platform users')
  await page.goto(`${BASE_URL}/admin/collections/platformUsers`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2000)
  await snap(page, '06-admin-platform-users')

  // ── 8. Frontend homepage ─────────────────────────────────────────
  console.log('\n[8] Frontend homepage')
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(3000)
  } catch { /* capture */ }
  await snap(page, '07-homepage')

  // ── 9. Frontend search ───────────────────────────────────────────
  console.log('\n[9] Frontend search')
  try {
    await page.goto(`${BASE_URL}/search`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(3000)
  } catch { /* capture */ }
  await snap(page, '08-search')

  // ── 10. Frontend login ───────────────────────────────────────────
  console.log('\n[10] Frontend login page')
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)
  } catch { /* capture */ }
  await snap(page, '09-frontend-login')

  // ── 11. Mobile ───────────────────────────────────────────────────
  console.log('\n[11] Mobile views')
  const desktopCookies = await ctx.cookies()
  const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  if (desktopCookies.length) await mCtx.addCookies(desktopCookies)
  const mPage = await mCtx.newPage()

  try {
    await mPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await mPage.waitForSelector('input', { timeout: 10000 }).catch(() => null)
    await mPage.waitForTimeout(1000)
  } catch { /* capture */ }
  await mPage.screenshot({ path: `${OUT_DIR}/10-admin-login-mobile.png`, timeout: 60000 })
  console.log('  ✓ 10-admin-login-mobile.png')

  try {
    await mPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await mPage.waitForTimeout(3000)
  } catch { /* capture */ }
  await mPage.screenshot({ path: `${OUT_DIR}/11-homepage-mobile.png`, timeout: 60000 })
  console.log('  ✓ 11-homepage-mobile.png')

  await mCtx.close()
  await ctx.close()
  await browser.close()
  console.log('\nAll done — screenshots in', OUT_DIR)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
