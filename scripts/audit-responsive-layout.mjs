import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'

const output = 'artifacts/responsive-layout'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ reducedMotion: 'reduce' })
const report = {
  date: new Date().toISOString(),
  errors: [],
  login: [],
  dashboard: [],
}
page.on('pageerror', (error) => report.errors.push(error.message))
await page.route('https://fonts.googleapis.com/**', (route) =>
  route.fulfill({ contentType: 'text/css', body: '' }),
)
await page.goto('http://127.0.0.1:5173/')
for (const [width, height] of [
  [1920, 900],
  [1536, 730],
  [1440, 800],
  [1366, 650],
  [1280, 620],
  [1024, 600],
  [900, 720],
  [768, 1024],
  [390, 844],
  [360, 800],
  [320, 568],
  [844, 390],
]) {
  await page.setViewportSize({ width, height })
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(200)
  report.login.push(
    await page.evaluate(() => {
      const r = (selector) => {
        const b = document.querySelector(selector).getBoundingClientRect()
        return {
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          bottom: b.bottom,
        }
      }
      return {
        width: innerWidth,
        height: innerHeight,
        pageHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        form: r('.auth-card'),
        submit: r('.auth-submit'),
        scene: r('.circuit-stage'),
      }
    }),
  )
  if ([1366, 1024, 390, 320, 844].includes(width))
    await page.screenshot({
      path: `${output}/login-${width}x${height}.png`,
      fullPage: true,
    })
}
await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
await page.getByRole('button', { name: 'Masuk', exact: true }).click()
await page.locator('.dashboard').waitFor()
for (const [width, height] of [
  [1920, 900],
  [1536, 730],
  [1366, 650],
  [1024, 600],
  [768, 1024],
  [390, 844],
  [320, 568],
  [844, 390],
]) {
  await page.setViewportSize({ width, height })
  await page.evaluate(() => scrollTo(0, 0))
  report.dashboard.push(
    await page.evaluate(() => {
      const hero = document
        .querySelector('.dashboard-hero')
        .getBoundingClientRect()
      const button = document
        .querySelector('.hero-copy .primary-button')
        .getBoundingClientRect()
      return {
        width: innerWidth,
        height: innerHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        heroBottom: hero.bottom,
        buttonBottom: button.bottom,
      }
    }),
  )
  if ([1366, 390, 320].includes(width))
    await page.screenshot({
      path: `${output}/dashboard-${width}x${height}.png`,
      fullPage: true,
    })
}
await fs.writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
