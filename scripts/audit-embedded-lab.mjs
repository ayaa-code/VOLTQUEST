import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const output = path.resolve('artifacts/embedded-lab')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
})
const report = { errors: [], requestsFailed: [], layouts: [], realPhet: {} }
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('requestfailed', (request) =>
  report.requestsFailed.push({
    url: request.url().split('?')[0],
    error: request.failure()?.errorText,
  }),
)
// External app fonts are not part of the audit; PhET itself is never mocked here.
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
try {
  await page.goto('http://127.0.0.1:5173/#misi-3')
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await page.getByRole('button', { name: 'Mulai simulasi di sini' }).click()
  try {
    const frame = await page.waitForEvent('framenavigated', {
      predicate: (frame) => frame.url().includes('circuit-construction-kit'),
      timeout: 30000,
    })
    await frame.waitForLoadState('load', { timeout: 30000 })
    // Wait for the real scene/PDOM to initialize, not just iframe.onload.
    await frame.waitForFunction(
      () =>
        document.querySelector('canvas, svg') &&
        document.body.innerText.length > 10,
      { timeout: 30000 },
    )
    report.realPhet = {
      loaded: true,
      title: await frame.title(),
      url: frame.url(),
      visibleTextSample: (await frame.locator('body').innerText()).slice(
        0,
        800,
      ),
    }
    const labScreen = frame
      .getByRole('button', { name: /Lab Screen|^Lab$/ })
      .first()
    if (await labScreen.count()) {
      // PhET draws its pointer UI over the accessible DOM. Use its keyboard UI.
      await labScreen.focus()
      await page.keyboard.press('Enter')
      await frame.waitForTimeout(1200)
      report.realPhet.afterKeyboardSelection = (
        await frame.locator('body').innerText()
      ).slice(0, 1400)
    }
    await page.screenshot({
      path: path.join(output, 'real-phet-guide-1440.png'),
      fullPage: true,
    })
  } catch (error) {
    report.realPhet = { loaded: false, error: error.message }
    await page.screenshot({
      path: path.join(output, 'real-phet-attempt-1440.png'),
      fullPage: true,
    })
  }
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    // Allow the external simulation's own resize handler to redraw its scene.
    await page.waitForTimeout(700)
    const layout = await page.evaluate(() => {
      const box = document
        .querySelector('.observation-table-scroll')
        .getBoundingClientRect()
      return {
        width: innerWidth,
        pageOverflow: document.documentElement.scrollWidth > innerWidth,
        tableWithinPage: box.x >= 0 && box.right <= innerWidth,
        formVisible: !!document.querySelector('.observation-form'),
        iframeCount: document.querySelectorAll('iframe').length,
      }
    })
    report.layouts.push(layout)
    await page.screenshot({
      path: path.join(output, `real-phet-table-${width}.png`),
      fullPage: true,
    })
  }
  // Capture every mission's empty table without claiming these are experiment results.
  for (const id of [1, 2, 4, 5]) {
    await page
      .getByRole('button', { name: 'Kembali ke misi', exact: true })
      .click()
    await page
      .locator('.mission-card')
      .nth(id - 1)
      .click()
    await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
    await page
      .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
      .click()
    await page
      .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
      .click()
    await page.screenshot({
      path: path.join(output, `m${id}-empty-table-1440.png`),
      fullPage: true,
    })
  }
  report.date = new Date().toISOString()
  report.browser = browser.version()
  await fs.writeFile(
    path.join(output, 'audit.json'),
    JSON.stringify(report, null, 2),
  )
  console.log(JSON.stringify(report, null, 2))
  if (
    report.layouts.some(
      (layout) => layout.pageOverflow || !layout.tableWithinPage,
    )
  )
    process.exitCode = 1
} finally {
  await browser.close()
}
