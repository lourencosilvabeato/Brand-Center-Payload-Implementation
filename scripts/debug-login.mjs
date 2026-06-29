import { chromium } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const EMAIL = 'admin@brandcenter.dev'
const PASSWORD = 'Admin@1234'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle', timeout: 60000 })
  await page.screenshot({ path: 'docs/screenshots/debug-a-loaded.png' })
  console.log('Page loaded, URL:', page.url())

  // Log all input fields found
  const inputs = await page.locator('input').all()
  console.log('Inputs found:', inputs.length)
  for (const inp of inputs) {
    const name = await inp.getAttribute('name').catch(() => null)
    const id = await inp.getAttribute('id').catch(() => null)
    const type = await inp.getAttribute('type').catch(() => null)
    console.log(`  input: name=${name} id=${id} type=${type}`)
  }

  // Fill the form
  const emailField = page.locator('#field-email').first()
  const pwField = page.locator('#field-password').first()
  await emailField.fill(EMAIL)
  await pwField.fill(PASSWORD)
  await page.screenshot({ path: 'docs/screenshots/debug-b-filled.png' })
  console.log('Fields filled')

  await page.click('button[type="submit"]')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'docs/screenshots/debug-c-after-submit.png' })
  console.log('After submit, URL:', page.url())

  // Log cookies
  const cookies = await ctx.cookies()
  console.log('Cookies:', cookies.map(c => `${c.name}=${c.value.slice(0, 30)}...`))

  await browser.close()
}

main().catch(err => { console.error(err); process.exit(1) })
