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

async function seedStudent(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [], visited: [] },
        },
      }),
    ),
  )
}

test('login loads no 3D scene; dashboard switch, visibility and navigation release resources', async ({
  page,
}) => {
  await instrument(page)
  const sceneRequests: string[] = []
  page.on('request', (request) => {
    if (/circuitScene|\/three[.]/.test(request.url()))
      sceneRequests.push(request.url())
  })
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(sceneRequests).toEqual([])
  await expectStopped(page)
  await page.getByLabel('Email', { exact: true }).fill('siswa@voltquest.demo')
  await page.getByLabel('Kata sandi', { exact: true }).fill('VoltQuest123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  const circuit = page.locator('.dashboard-circuit')
  await expect(circuit).toHaveAttribute('data-renderer', '3d')
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect(page.locator('.circuit-pause')).toHaveCount(0)
  const control = page.getByRole('switch', { name: 'Saklar rangkaian' })
  await control.focus()
  await page.keyboard.press('Space')
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await expectStopped(page)
  await page.keyboard.press('Enter')
  await expect(control).toHaveAttribute('aria-checked', 'true')
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page.evaluate(() => window.energyProbe.setHidden(true))
  await expectStopped(page)
  await page.evaluate(() => window.energyProbe.setHidden(false))
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Explore Lessons' }).click()
    await expect(page.locator('canvas')).toHaveCount(0)
    await expectStopped(page)
    expect(
      await page.evaluate(() => ({
        observers: window.energyProbe.observers,
        listeners: window.energyProbe.listeners,
      })),
    ).toEqual({ observers: 0, listeners: 0 })
    await page
      .getByRole('button', { name: 'Kembali ke Listrik Dinamis' })
      .click()
    await expect(circuit).toHaveAttribute('data-renderer', '3d')
    await expect(page.locator('canvas')).toHaveCount(1)
  }
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await expect(page.locator('.auth-card')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expectStopped(page)
  expect(await page.evaluate(() => window.energyProbe.maxPending)).toBe(1)
})

test('reduced motion and offscreen suspension keep the dashboard switch usable', async ({
  page,
}) => {
  await instrument(page)
  await seedStudent(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const circuit = page.locator('.dashboard-circuit')
  await expect(circuit).toHaveAttribute('data-renderer', '3d')
  await expectStopped(page)
  await page.getByRole('switch').click()
  await expect(page.getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'false',
  )
  await expectStopped(page)
  await page.getByRole('switch').click()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
  await page.setViewportSize({ width: 390, height: 250 })
  await page.locator('.learning-progress').scrollIntoViewIfNeeded()
  await expectStopped(page)
  await circuit.scrollIntoViewIfNeeded()
  await expect
    .poll(() => page.evaluate(() => window.energyProbe.pending))
    .toBe(1)
})

test('WebGL unavailability does not affect login or block learning', async ({
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
  await expect(page.locator('canvas')).toHaveCount(0)
  await page.getByLabel('Email', { exact: true }).fill('siswa@voltquest.demo')
  await page.getByLabel('Kata sandi', { exact: true }).fill('VoltQuest123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Welcome, Young Scientist! ⚡' }),
  ).toBeVisible()
  await expect(
    page.getByRole('status').filter({ hasText: /belum didukung/i }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByRole('heading', { name: 'Arus Listrik' }),
  ).toBeVisible()
})

test('GPU context loss removes the dashboard canvas and retains the switch', async ({
  page,
}) => {
  await seedStudent(page)
  await page.goto('/')
  const circuit = page.locator('.dashboard-circuit')
  await expect(circuit).toHaveAttribute('data-renderer', '3d')
  await circuit
    .locator('canvas')
    .evaluate((element) =>
      element.dispatchEvent(
        new Event('webglcontextlost', { cancelable: true }),
      ),
    )
  await expect(circuit).toHaveAttribute('data-renderer', 'unavailable')
  await expect(page.locator('canvas')).toHaveCount(0)
  await page.getByRole('switch').click()
  await expect(page.getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'false',
  )
})
