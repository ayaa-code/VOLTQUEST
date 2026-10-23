import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Keep external font availability out of lifecycle assertions.
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  )
})

declare global {
  interface Window {
    energyProbe: {
      pending: number
      callbacks: number
      maxPending: number
      observers: number
      listeners: number
      setHidden: (hidden: boolean) => void
    }
  }
}

async function instrument(page: Page) {
  await page.addInitScript(() => {
    const pending = new Set<number>()
    const observers = new Set<IntersectionObserver>()
    const listeners = new Set<EventListenerOrEventListenerObject | null>()
    let callbacks = 0
    let maxPending = 0
    const request = window.requestAnimationFrame.bind(window)
    const cancel = window.cancelAnimationFrame.bind(window)
    window.requestAnimationFrame = (callback) => {
      const id = request((time) => {
        pending.delete(id)
        callbacks++
        callback(time)
      })
      pending.add(id)
      maxPending = Math.max(maxPending, pending.size)
      return id
    }
    window.cancelAnimationFrame = (id) => {
      pending.delete(id)
      cancel(id)
    }
    const NativeObserver = window.IntersectionObserver
    window.IntersectionObserver = class extends NativeObserver {
      override observe(target: Element) {
        observers.add(this)
        super.observe(target)
      }
      override disconnect() {
        observers.delete(this)
        super.disconnect()
      }
    }
    const add = EventTarget.prototype.addEventListener
    const remove = EventTarget.prototype.removeEventListener
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (
        type === 'visibilitychange' ||
        (this instanceof MediaQueryList && type === 'change')
      )
        listeners.add(listener)
      add.call(this, type, listener, options)
    }
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      listeners.delete(listener)
      remove.call(this, type, listener, options)
    }
    window.energyProbe = {
      get pending() {
        return pending.size
      },
      get callbacks() {
        return callbacks
      },
      get maxPending() {
        return maxPending
      },
      get observers() {
        return observers.size
      },
      get listeners() {
        return listeners.size
      },
      setHidden(hidden) {
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          get: () => hidden,
        })
        document.dispatchEvent(new Event('visibilitychange'))
      },
    }
  })
}

async function expectStopped(page: Page) {
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(0)
  const count = await page.evaluate(() => window.energyProbe.callbacks)
  // An observation window, not an exact animation-phase deadline.
  await page.waitForTimeout(200)
  expect(await page.evaluate(() => window.energyProbe.callbacks)).toBe(count)
}

test('keyboard pause, uninterrupted form, StrictMode and unmount cleanup', async ({
  page,
}) => {
  await instrument(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Jeda animasi' })
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.callbacks))
    .toBeGreaterThan(2)
  await toggle.focus()
  expect(
    await toggle.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).toBe('solid')
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('button', { name: 'Putar animasi' }),
  ).toBeFocused()
  await expectStopped(page)
  const frozen = await page.locator('.energy-art').innerHTML()
  await page.waitForTimeout(200)
  expect(await page.locator('.energy-art').innerHTML()).toBe(frozen)
  await page.keyboard.press('Space')
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page.getByRole('button', { name: 'Masuk atau Daftar' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
  await expect(page.getByLabel('Siapa nama panggilanmu?')).toHaveValue('Nara')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.dashboard')).toBeVisible()
  await expect(page.locator('.energy-art')).toHaveCount(0)
  await expectStopped(page)
  expect(
    await page.evaluate(() => ({
      max: window.energyProbe.maxPending,
      observers: window.energyProbe.observers,
      listeners: window.energyProbe.listeners,
    })),
  ).toEqual({ max: 1, observers: 0, listeners: 0 })
  expect(errors).toEqual([])
})

test('initial and live reduced motion stay static with no frame loop', async ({
  page,
}) => {
  await instrument(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.energy-art')).toHaveAttribute(
    'data-phase',
    'static',
  )
  await expect(
    page.getByText('Ilustrasi statis · gerak dikurangi'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /animasi/ })).toHaveCount(0)
  await expectStopped(page)
  expect(await page.evaluate(() => window.energyProbe.callbacks)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.callbacks))
    .toBeGreaterThan(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.energy-art')).toHaveAttribute(
    'data-phase',
    'static',
  )
  await expectStopped(page)
  const staticImage = await page.locator('.energy-art').innerHTML()
  await page.waitForTimeout(200)
  expect(await page.locator('.energy-art').innerHTML()).toBe(staticImage)
})

test('visibility event and real offscreen scrolling suspend work', async ({
  page,
}) => {
  await instrument(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page.evaluate(() => window.energyProbe.setHidden(true))
  await expectStopped(page)
  const before = await page.locator('.energy-art').innerHTML()
  await page.waitForTimeout(200)
  expect(await page.locator('.energy-art').innerHTML()).toBe(before)
  await page.evaluate(() => window.energyProbe.setHidden(false))
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  // Resume schedules work again. The frozen SVG was not rewritten while hidden.
  expect(before).toBeTruthy()
  await page.setViewportSize({ width: 390, height: 150 })
  await page.locator('.onboarding-bottom').scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      page
        .locator('.energy-art')
        .evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThanOrEqual(0)
  await expectStopped(page)
  await page.locator('.energy-art').scrollIntoViewIfNeeded()
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
})

test('onboarding and name form fit five widths without decorative overlap', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await expect(page.locator('.welcome-card .energy-art')).toHaveCount(1)
    const brand = await page.locator('.welcome-card > .brand').boundingBox()
    const heading = await page.locator('.welcome-copy').boundingBox()
    const animation = await page.locator('.energy-animation').boundingBox()
    const login = await page
      .getByRole('button', { name: 'Masuk atau Daftar' })
      .boundingBox()
    expect(brand!.y + brand!.height).toBeLessThanOrEqual(heading!.y)
    expect(heading!.y + heading!.height).toBeLessThanOrEqual(animation!.y)
    expect(animation!.y + animation!.height).toBeLessThanOrEqual(login!.y)
    expect(
      await page.locator('.welcome-copy h1').evaluate((element) => {
        const box = element.getBoundingClientRect()
        return element.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        )
      }),
    ).toBe(true)
    await expect(page.locator('.energy-art')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(
      await page
        .locator('.energy-art')
        .evaluate((el) => getComputedStyle(el).pointerEvents),
    ).toBe('none')
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const control = page.getByRole('button', { name: 'Jeda animasi' })
  const box = await control.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
  await page.getByRole('button', { name: 'Masuk atau Daftar' }).click()
  await page
    .getByLabel('Siapa nama panggilanmu?')
    .fill('Nama Panjang Untuk Pemeriksaan Tampilan')
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await expect(
      page.getByRole('button', { name: 'Masuk', exact: true }),
    ).toBeEnabled()
  }
})
