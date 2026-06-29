// node scripts/take-screenshots.cjs
const { chromium } = require('C:/Users/LourençoBeato/Studio/brand-center/node_modules/playwright');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3001';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');

const DESKTOP = { width: 1440, height: 900 };
const MOBILE  = { width: 390,  height: 844 };

const EXT_EMAIL    = 'external@test.com';
const EXT_PASS     = 'ScreenshotTemp1!';
const ADMIN_EMAIL  = 'screenshot-admin@brandcenter.dev';
const ADMIN_PASS   = 'ScreenshotAdmin1!';

function apiLogin(email, password, collection) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ email, password });
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/${collection}/login`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`Login failed ${res.statusCode}: ${data}`));
        const parsed = JSON.parse(data);
        // Extract Set-Cookie header
        const setCookie = res.headers['set-cookie'] || [];
        resolve({ token: parsed.token, cookies: setCookie });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseCookies(setCookieHeaders) {
  return setCookieHeaders.map(header => {
    const parts = header.split(';');
    const [nameVal] = parts;
    const [name, ...rest] = nameVal.split('=');
    return {
      name: name.trim(),
      value: rest.join('=').trim(),
      domain: 'localhost',
      path: '/',
    };
  });
}

async function save(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${name}`);
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ── 1. Login page (unauthenticated) ──────────────────────────────────────────
  console.log('\n1. Login page');
  {
    const ctx  = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await goto(page, `${BASE}/login`);
    await save(page, 'login.png');
    await ctx.close();
  }

  // ── Get auth cookies ──────────────────────────────────────────────────────────
  console.log('\nLogging in via API...');
  const extLogin   = await apiLogin(EXT_EMAIL, EXT_PASS, 'externalUsers');
  const adminLogin = await apiLogin(ADMIN_EMAIL, ADMIN_PASS, 'platformUsers');
  console.log('  ✓ external user token obtained');
  console.log('  ✓ admin token obtained');

  // ── 2–7. Authenticated frontend pages ────────────────────────────────────────
  console.log('\n2. Authenticated frontend pages');
  {
    const extCookies = parseCookies(extLogin.cookies);
    // Also inject as payload-token cookie manually in case Set-Cookie wasn't set
    const tokenCookie = { name: 'payload-token', value: extLogin.token, domain: 'localhost', path: '/' };
    const allCookies = extCookies.length > 0 ? extCookies : [tokenCookie];

    const ctx  = await browser.newContext({ viewport: DESKTOP });
    await ctx.addCookies(allCookies);
    // If no cookie from Set-Cookie, add token manually
    if (!extCookies.find(c => c.name === 'payload-token')) {
      await ctx.addCookies([tokenCookie]);
    }
    const page = await ctx.newPage();

    // Homepage
    console.log('  Homepage');
    await goto(page, BASE);
    await save(page, 'homepage.png');

    // Mega-menu — hover first L1 nav link
    console.log('  Mega-menu');
    await goto(page, BASE);
    const navLinks = page.locator('header nav ul > li');
    const count = await navLinks.count();
    console.log(`    found ${count} nav items`);
    if (count > 0) {
      await navLinks.nth(1).hover();
      await page.waitForTimeout(700);
      await save(page, 'mega-menu.png');
    } else {
      await save(page, 'mega-menu.png');
    }

    // Channel page — Brand Principles (L1)
    console.log('  Channel page');
    await goto(page, `${BASE}/brand-principles`);
    await save(page, 'channel-page.png');

    // Content page — try multiple paths
    console.log('  Content page');
    const contentPaths = [
      `${BASE}/brand-principles/2nd-level-entry-1/3rd-level-entry-1`,
      `${BASE}/brand-principles/2nd-level-entry-1/3rd-level-entry-2`,
      `${BASE}/brand-identity/test1`,
      `${BASE}/digital-applications/test2`,
    ];
    for (const url of contentPaths) {
      await goto(page, url);
      const is404 = await page.locator('h1:has-text("404"), text=404').isVisible({ timeout: 1000 }).catch(() => false);
      if (!is404) {
        console.log(`    using: ${url}`);
        break;
      }
    }
    await save(page, 'content-page.png');

    // Search
    console.log('  Search');
    await goto(page, `${BASE}/search?q=brand`);
    await save(page, 'search.png');

    await ctx.close();
  }

  // ── 8. Payload Admin ─────────────────────────────────────────────────────────
  console.log('\n3. Payload Admin');
  {
    const adminCookies = parseCookies(adminLogin.cookies);
    const adminTokenCookie = { name: 'payload-token', value: adminLogin.token, domain: 'localhost', path: '/' };
    const allAdminCookies = adminCookies.length > 0 ? adminCookies : [adminTokenCookie];

    const ctx  = await browser.newContext({ viewport: DESKTOP });
    await ctx.addCookies(allAdminCookies);
    if (!adminCookies.find(c => c.name === 'payload-token')) {
      await ctx.addCookies([adminTokenCookie]);
    }
    const page = await ctx.newPage();
    await goto(page, `${BASE}/admin`);
    await page.waitForTimeout(1000);
    await save(page, 'admin.png');
    await ctx.close();
  }

  // ── 9. Mobile — homepage + open menu ─────────────────────────────────────────
  console.log('\n4. Mobile');
  {
    const extCookies = parseCookies(extLogin.cookies);
    const tokenCookie = { name: 'payload-token', value: extLogin.token, domain: 'localhost', path: '/' };

    const ctx  = await browser.newContext({ viewport: MOBILE });
    await ctx.addCookies(extCookies.length > 0 ? extCookies : [tokenCookie]);
    if (!extCookies.find(c => c.name === 'payload-token')) {
      await ctx.addCookies([tokenCookie]);
    }
    const page = await ctx.newPage();
    await goto(page, BASE);
    // Click hamburger
    const hamburger = page.locator('button[class*="hamburger"]').first();
    const visible = await hamburger.isVisible({ timeout: 3000 }).catch(() => false);
    if (visible) {
      await hamburger.click();
      await page.waitForTimeout(700);
      console.log('    hamburger opened');
    } else {
      console.log('    (hamburger not found)');
    }
    await save(page, 'mobile.png');
    await ctx.close();
  }

  await browser.close();
  console.log('\nAll screenshots saved to docs/screenshots/');
})();
