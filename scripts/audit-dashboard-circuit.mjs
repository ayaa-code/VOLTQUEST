import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'

const output = 'artifacts/dashboard-circuit'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
})
const report = { date: new Date().toISOString(), errors: [], layouts: [] }
page.on('pageerror', (error) => report.errors.push(error.message))
await page.route('https://fonts.googleapis.com/**', (route) =>
  route.fulfill({ contentType: 'text/css', body: '' }),
)
await page.addInitScript(() =>
  localStorage.setItem(
    'voltquest.v1',
    JSON.stringify({
      active: 'student:audit',
      profiles: {
        'student:audit': { name: 'Audit', completed: [], visited: [] },
      },
    }),
  ),
)
await page.goto('http://127.0.0.1:5173/')
await page.locator('.dashboard-circuit[data-renderer="3d"]').waitFor()
for (const [width, height] of [
  [320, 568],
  [390, 844],
  [768, 1024],
  [1024, 600],
  [1440, 900],
  [1920, 1080],
]) {
  await page.setViewportSize({ width, height })
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(250)
  report.layouts.push(
    await page.evaluate(() => {
      const rect = (selector) => {
        const r = document.querySelector(selector).getBoundingClientRect()
        return {
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          bottom: r.bottom,
        }
      }
      return {
        width: innerWidth,
        height: innerHeight,
        overflow: document.documentElement.scrollWidth > innerWidth,
        hero: rect('.dashboard-hero'),
        copy: rect('.hero-copy'),
        scene: rect('.dashboard-circuit'),
        renderer: document.querySelector('.dashboard-circuit').dataset.renderer,
        canvasCount: document.querySelectorAll('canvas').length,
      }
    }),
  )
  await page.screenshot({
    path: `${output}/dashboard-${width}.png`,
    fullPage: true,
  })
}
await page.setViewportSize({ width: 1440, height: 900 })
await page.getByRole('switch').click()
await page.waitForTimeout(200)
await page
  .locator('.dashboard-hero')
  .screenshot({ path: `${output}/switch-off.png` })
await fs.writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
