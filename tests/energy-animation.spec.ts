import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { OrthographicCamera, Vector3 } from 'three'

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

test('3D switch, keyboard pause, visibility and unmount release animation resources', async ({
  page,
}) => {
  await instrument(page)
  await page.goto('/')
  await expect(page.locator('.login-circuit')).toHaveAttribute(
    'data-renderer',
    '3d',
  )
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.callbacks))
    .toBeGreaterThan(2)
  const control = page.getByRole('switch', { name: 'Saklar rangkaian' })
  await control.focus()
  await page.keyboard.press('Space')
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await expect(
    page.getByRole('img', { name: /Saklar terbuka, lampu mati/ }),
  ).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(control).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('button', { name: 'Jeda animasi' }).click()
  await expectStopped(page)
  await page.getByRole('button', { name: 'Putar animasi' }).click()
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page.evaluate(() => window.energyProbe.setHidden(true))
  await expectStopped(page)
  await page.evaluate(() => window.energyProbe.setHidden(false))
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page
    .getByRole('button', { name: 'Buka profil lama tanpa email' })
    .click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.dashboard')).toBeVisible()
  await expectStopped(page)
  expect(
    await page.evaluate(() => ({
      observers: window.energyProbe.observers,
      listeners: window.energyProbe.listeners,
    })),
  ).toEqual({ observers: 0, listeners: 0 })
})

test('reduced motion and offscreen pause keep switch interactive', async ({
  page,
}) => {
  await instrument(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.login-circuit')).toHaveAttribute(
    'data-renderer',
    '3d',
  )
  await expectStopped(page)
  await page.getByRole('switch').click()
  await expect(page.getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'false',
  )
  await expectStopped(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page.setViewportSize({ width: 390, height: 250 })
  await page.locator('.electric-level').scrollIntoViewIfNeeded()
  await expectStopped(page)
  await page.locator('.circuit-stage').scrollIntoViewIfNeeded()
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
})

test('WebGL unavailable still gives an interactive SVG and working login', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('.login-circuit-svg')).toBeVisible()
  await page.getByRole('switch').click()
  await expect(page.locator('.fallback-current')).toHaveCount(0)
  await page.getByRole('switch').click()
  await expect(page.locator('.fallback-current')).toBeVisible()
  await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Halo, Penjelajah!' }),
  ).toBeVisible()
})

test('responsive 320 to 1920 layout preserves form and touch targets', async ({
  page,
}) => {
  await page.goto('/')
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 1000],
    [1920, 1080],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const visual = await page.locator('.electric-visual').boundingBox()
    const card = await page.locator('.auth-card').boundingBox()
    if (width <= 850)
      expect(visual!.y + visual!.height).toBeLessThanOrEqual(card!.y)
    else expect(visual!.x + visual!.width).toBeLessThanOrEqual(card!.x)
    for (const selector of [
      '.auth-submit',
      '.auth-eye',
      '.circuit-toggle',
      '.circuit-pause:not(.circuit-lightweight)',
    ]) {
      const box = await page.locator(selector).boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  }
})

test('clicking the 3D switch and GPU context loss both retain usable controls', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('.login-circuit')).toHaveAttribute(
    'data-renderer',
    '3d',
  )
  const canvas = page.locator('.circuit-webgl canvas')
  const bounds = await canvas.boundingBox()
  const aspect = bounds!.width / bounds!.height
  const half = Math.max(3.5, 2.05 * aspect)
  const camera = new OrthographicCamera(
    -half,
    half,
    half / aspect,
    -half / aspect,
    0.1,
    30,
  )
  camera.position.set(3.3, 6, 7.5)
  camera.lookAt(0, 0.1, 0)
  camera.updateMatrixWorld()
  const position = new Vector3(-0.85, 0.4, -1.2).project(camera)
  await canvas.click({
    position: {
      x: ((position.x + 1) / 2) * bounds!.width,
      y: ((-position.y + 1) / 2) * bounds!.height,
    },
  })
  await expect(page.getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'false',
  )
  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
  )
  await expect(page.locator('.login-circuit')).toHaveAttribute(
    'data-renderer',
    'svg',
  )
  await expect(canvas).toHaveCount(0)
  await page.locator('.login-circuit-svg rect[fill="transparent"]').click()
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
})

test('low resource devices skip the 3D module download', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (
      request.url().includes('/circuitScene') ||
      request.url().includes('/three.js')
    )
      requests.push(request.url())
  })
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 2,
      configurable: true,
    }),
  )
  await page.goto('/')
  await expect(page.locator('.login-circuit-svg')).toBeVisible()
  await page.getByRole('switch').click()
  await expect(page.locator('.fallback-current')).toHaveCount(0)
  expect(requests).toEqual([])
})
