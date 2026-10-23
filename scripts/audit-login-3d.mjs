import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'

const root = 'artifacts/login-3d'
await fs.mkdir(root, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { date: new Date().toISOString(), errors: [], layouts: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
await page.route('https://fonts.googleapis.com/**', (route) =>
  route.fulfill({ contentType: 'text/css', body: '' }),
)
await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2000)
report.renderer = await page
  .locator('.login-circuit')
  .getAttribute('data-renderer')
for (const [width, height] of [
  [1440, 1000],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 740],
  [844, 390],
  [1920, 1080],
]) {
  await page.setViewportSize({ width, height })
  await page.waitForTimeout(400)
  report.layouts.push(
    await page.evaluate(() => {
      const rect = (s) => {
        const r = document.querySelector(s).getBoundingClientRect()
        return { x: r.x, y: r.y, width: r.width, height: r.height }
      }
      return {
        width: innerWidth,
        height: innerHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        visual: rect('.electric-visual'),
        form: rect('.auth-card'),
      }
    }),
  )
  await page.screenshot({ path: `${root}/login-${width}.png`, fullPage: true })
}
await page.setViewportSize({ width: 1440, height: 1000 })
await page.getByRole('switch', { name: 'Saklar rangkaian' }).click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${root}/switch-off.png`, fullPage: true })
await fs.writeFile(`${root}/audit.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
