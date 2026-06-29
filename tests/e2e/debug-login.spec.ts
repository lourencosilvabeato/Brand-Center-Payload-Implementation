import { test } from '@playwright/test'
import path from 'path'

test('debug admin login', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  const requests: string[] = []
  page.on('request', req => {
    if (req.method() !== 'GET') requests.push(`${req.method()} ${req.url()}`)
  })
  page.on('response', async resp => {
    if (resp.request().method() !== 'GET') {
      try {
        const body = await resp.text()
        requests.push(`  → ${resp.status()} ${body.slice(0, 300)}`)
      } catch {}
    }
  })

  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' })
  await page.fill('#field-email', 'screenshots@brandcenter.dev')
  await page.fill('#field-password', 'Screenshots@2024')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(5000)

  console.log('Final URL:', page.url())
  for (const r of requests) console.log(r)

  await page.screenshot({ path: path.join('docs/screenshots', 'debug-login.png') })
})
