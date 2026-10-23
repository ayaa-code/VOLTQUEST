import fs from 'node:fs/promises'
import { chromium } from '@playwright/test'

const output = 'artifacts/circuit-polish'
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const report = { date: new Date().toISOString(), errors: [], layouts: [] }
for (const variant of ['login', 'dashboard']) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 800 },
    reducedMotion: 'reduce',
  })
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  page.on('pageerror', (error) => report.errors.push(error.message))
  if (variant === 'dashboard')
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
  const circuit = page.locator(`.${variant}-circuit`)
  await page.locator('[data-renderer="3d"]').waitFor()
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 800 })
    await circuit.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    report.layouts.push(
      await circuit.evaluate((element) => {
        const stage = element
          .querySelector('.circuit-stage')
          .getBoundingClientRect()
        const controls = element
          .querySelector('.circuit-controls')
          .getBoundingClientRect()
        const labels = [...element.querySelectorAll('.circuit-label')].map(
          (label) => {
            const rect = label.getBoundingClientRect()
            return {
              text: label.textContent,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
            }
          },
        )
        return {
          variant: element.dataset.variant,
          renderer: element.dataset.renderer,
          width: innerWidth,
          labelOutsideStage: labels.some(
            (label) =>
              label.left < stage.left ||
              label.right > stage.right ||
              label.top < stage.top ||
              label.bottom > stage.bottom,
          ),
          labelOverControls: labels.some(
            (label) => label.bottom > controls.top,
          ),
          overflow: document.documentElement.scrollWidth > innerWidth,
          labels,
        }
      }),
    )
    if ([1440, 390, 320].includes(width))
      await circuit.screenshot({
        path: `${output}/${variant}-3d-${width}.png`,
      })
  }
  await page.setViewportSize({ width: 1440, height: 800 })
  await circuit.getByRole('switch').click()
  await circuit.screenshot({ path: `${output}/${variant}-3d-off.png` })
  await page.close()
}
await fs.writeFile(`${output}/audit.json`, JSON.stringify(report, null, 2))
console.log(
  JSON.stringify({
    errors: report.errors,
    labelOutsideStage: report.layouts.filter((x) => x.labelOutsideStage),
    labelOverControls: report.layouts.filter((x) => x.labelOverControls),
    overflow: report.layouts.filter((x) => x.overflow),
    count: report.layouts.length,
  }),
)
await browser.close()
