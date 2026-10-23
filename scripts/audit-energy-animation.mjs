import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const output = path.resolve('artifacts/energy-centered')
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
const measurements = []
const errors = []
async function prepare(context) {
  // External Google Fonts may be blocked on the audit host. Exercise the app's fallback fonts.
  await context.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  )
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('http://127.0.0.1:5173')
  await page.locator('.energy-art').waitFor()
  await page
    .locator('.welcome-card')
    .evaluate((element) =>
      Promise.all(
        element.getAnimations().map((animation) => animation.finished),
      ),
    )
  return page
}
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 1050 },
      reducedMotion: 'no-preference',
    })
    const page = await prepare(context)
    for (const phase of ['open', 'closed', 'opening']) {
      await page.waitForFunction(
        (phase) => {
          const svg = document.querySelector('.energy-art')
          const light = svg?.querySelector('.energy-light')
          return (
            svg?.getAttribute('data-phase') === phase &&
            (phase !== 'closed' ||
              Number(light?.getAttribute('opacity')) > 0.95)
          )
        },
        phase,
        { timeout: 20000, polling: 50 },
      )
      await page.screenshot({
        path: path.join(output, `${phase}-${width}.png`),
        fullPage: true,
      })
      measurements.push(
        await page.evaluate(
          ({ width, phase }) => {
            const heading = document.querySelector('.welcome-copy h1')
            const title = heading.getBoundingClientRect()
            const button = document
              .querySelector('.energy-toggle')
              .getBoundingClientRect()
            return {
              width,
              phase,
              overflow: document.documentElement.scrollWidth > innerWidth,
              copyBlocked: !heading.contains(
                document.elementFromPoint(
                  title.x + title.width / 2,
                  title.y + title.height / 2,
                ),
              ),
              controlWidth: button.width,
              controlHeight: button.height,
            }
          },
          { width, phase },
        ),
      )
    }
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.locator('.energy-art[data-phase="static"]').waitFor()
    await page.screenshot({
      path: path.join(output, `reduced-motion-${width}.png`),
      fullPage: true,
    })
    await page.getByRole('button', { name: 'Masuk atau Daftar' }).click()
    await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
    await page.screenshot({
      path: path.join(output, `name-form-${width}.png`),
      fullPage: true,
    })
    await context.close()
    console.log(`Captured phases, reduced motion and name form: ${width}px`)
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: 'no-preference',
    recordVideo: {
      dir: path.join(output, 'recordings'),
      size: { width: 1440, height: 1050 },
    },
  })
  const page = await prepare(context)
  const timeline = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const svg = document.querySelector('.energy-art')
        const light = svg.querySelector('.energy-light')
        const contact = svg.querySelector('line')
        const phases = new Set()
        const frameDurations = []
        let previous = performance.now()
        const start = previous
        let prematureLightFrames = 0
        const sample = (now) => {
          frameDurations.push(now - previous)
          previous = now
          phases.add(svg.getAttribute('data-phase'))
          if (
            Number(light.getAttribute('opacity')) > 0.001 &&
            contact.getAttribute('transform') !== 'rotate(0 178 64)'
          )
            prematureLightFrames++
          if (now - start >= 14000) {
            frameDurations.sort((a, b) => a - b)
            resolve({
              durationMs: now - start,
              sampledFrames: frameDurations.length,
              phases: [...phases],
              prematureLightFrames,
              medianFrameIntervalMs:
                frameDurations[Math.floor(frameDurations.length / 2)],
              p95FrameIntervalMs:
                frameDurations[Math.floor(frameDurations.length * 0.95)],
            })
          } else requestAnimationFrame(sample)
        }
        requestAnimationFrame(sample)
      }),
  )
  const video = page.video()
  await context.close()
  await video.saveAs(path.join(output, 'one-cycle-desktop.webm'))
  await video.delete()
  const report = {
    browser: await browser.version(),
    date: new Date().toISOString(),
    fonts: 'existing system fallback; external Google Fonts stubbed',
    measurements,
    timeline,
    errors,
  }
  await fs.writeFile(
    path.join(output, 'measurements.json'),
    JSON.stringify(report, null, 2),
  )
  console.log(JSON.stringify(report, null, 2))
  if (
    errors.length ||
    measurements.some(
      (m) =>
        m.overflow ||
        m.copyBlocked ||
        m.controlWidth < 44 ||
        m.controlHeight < 44,
    ) ||
    timeline.prematureLightFrames
  )
    process.exitCode = 1
} finally {
  await browser.close()
}
