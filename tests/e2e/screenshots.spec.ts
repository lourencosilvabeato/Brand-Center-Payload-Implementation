/**
 * Captures all 8 README screenshots into docs/screenshots/.
 * Run: pnpm playwright test tests/e2e/screenshots.spec.ts --reporter=line
 *
 * Uses the Payload admin login (admin@brandcenter.dev) whose payload-token
 * cookie is accepted by the frontend middleware for any authenticated role.
 */
import { test, expect, BrowserContext } from '@playwright/test'
import path from 'path'

const BASE = 'http://localhost:3000'
const OUT = path.resolve('docs/screenshots')

const ADMIN_EMAIL = 'screenshots@brandcenter.dev'
const ADMIN_PASSWORD = 'Screenshots@2024'

// ── helpers ────────────────────────────────────────────────────────────────

async function shot(context: BrowserContext, url: string, filename: string) {
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(OUT, filename), fullPage: false })
  console.log(`  ✓ ${filename}`)
  await page.close()
}

// ── tests ──────────────────────────────────────────────────────────────────

test.describe('README screenshots', () => {
  test.setTimeout(60_000)

  // 1. Login page — no auth needed
  test('login', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: path.join(OUT, 'login.png'), fullPage: false })
    console.log('  ✓ login.png')
  })

  // 2–7. Authenticated pages — share one browser context logged into /admin
  test.describe('authenticated', () => {
    let ctx: BrowserContext

    test.beforeAll(async ({ browser }) => {
      ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const page = await ctx.newPage()
      await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' })
      await page.fill('#field-email', ADMIN_EMAIL)
      await page.fill('#field-password', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL(`${BASE}/admin`, { timeout: 15_000 })
      await page.waitForLoadState('networkidle')
      await page.close()
    })

    test.afterAll(async () => {
      await ctx.close()
    })

    // 2. Admin dashboard
    test('admin', async () => {
      await shot(ctx, `${BASE}/admin`, 'admin.png')
    })

    // 3. Homepage
    test('homepage', async () => {
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })

      // Verify we're on the platform (not redirected to /login)
      await expect(page).not.toHaveURL(/\/login/)

      await page.screenshot({ path: path.join(OUT, 'homepage.png'), fullPage: false })
      console.log('  ✓ homepage.png')
      await page.close()
    })

    // 4. Channel page
    test('channel-page', async () => {
      await shot(ctx, `${BASE}/brand-principles`, 'channel-page.png')
    })

    // 5. Content page
    test('content-page', async () => {
      await shot(
        ctx,
        `${BASE}/brand-principles/2nd-level-entry-1/3rd-level-entry-1`,
        'content-page.png',
      )
    })

    // 6. Search results
    test('search', async () => {
      await shot(ctx, `${BASE}/search?q=brand`, 'search.png')
    })

    // 7. Mega-menu — hover over first nav item that has children
    test('mega-menu', async () => {
      const page = await ctx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })

      // Hover the first nav item — onMouseEnter opens the mega-menu
      const navItem = page.locator('[class*="navItem"]').first()
      await navItem.hover()
      await page.waitForTimeout(600) // let the overlay animate in

      await page.screenshot({ path: path.join(OUT, 'mega-menu.png'), fullPage: false })
      console.log('  ✓ mega-menu.png')
      await page.close()
    })

    // 8. Mobile menu — narrow viewport, click hamburger
    test('mobile', async ({ browser }) => {
      const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })

      // Copy the payload-token cookie from the desktop context
      const cookies = await ctx.cookies()
      await mobileCtx.addCookies(cookies)

      const page = await mobileCtx.newPage()
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.click('button[aria-label="Open navigation menu"]')
      await page.waitForTimeout(400) // let the menu slide in

      await page.screenshot({ path: path.join(OUT, 'mobile.png'), fullPage: false })
      console.log('  ✓ mobile.png')
      await page.close()
      await mobileCtx.close()
    })
  })
})
