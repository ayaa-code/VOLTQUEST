import { test, expect } from '@playwright/test'
import { OrthographicCamera, Vector3 } from 'three'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.addInitScript(() => {
    if (!localStorage.getItem('voltquest.v1'))
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: 'student:nara',
          profiles: {
            'student:nara': { name: 'Nara', completed: [], visited: [] },
          },
        }),
      )
  })
})

test('dashboard switch and object click do not modify learning data', async ({
  page,
}) => {
  await page.goto('/')
  const circuit = page.locator('.dashboard-circuit')
  await expect(circuit).toHaveAttribute('data-renderer', '3d')
  await expect(page.locator('.hero-art .circuit-art')).toHaveCount(0)
  const original = await page.evaluate(() =>
    localStorage.getItem('voltquest.v1'),
  )
  const control = circuit.getByRole('switch')
  await control.focus()
  await page.keyboard.press('Space')
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await expect(circuit.getByRole('img')).toHaveAccessibleName(/lampu mati/)
  await page.keyboard.press('Enter')
  await expect(control).toHaveAttribute('aria-checked', 'true')
  const canvas = circuit.locator('canvas')
  const box = await canvas.boundingBox()
  const aspect = box!.width / box!.height
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
  const point = new Vector3(-0.85, 0.4, -1.2).project(camera)
  await canvas.click({
    position: {
      x: ((point.x + 1) / 2) * box!.width,
      y: ((-point.y + 1) / 2) * box!.height,
    },
  })
  await expect(control).toHaveAttribute('aria-checked', 'false')
  await expect(circuit.locator('.circuit-pause')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(circuit).toHaveClass(/is-paused/)
  await control.click()
  await expect(control).toHaveAttribute('aria-checked', 'true')
  expect(await page.evaluate(() => localStorage.getItem('voltquest.v1'))).toBe(
    original,
  )
  expect(
    await page.evaluate(() => localStorage.getItem('voltquest.experiments.v1')),
  ).toBe(null)
  await expect(page.locator('.header-xp')).toHaveCount(0)
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByRole('heading', { name: 'Arus Listrik' }),
  ).toBeVisible()
})

test('pastel scene stays below copy on mobile, beside copy on desktop and within hero', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 600],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const copy = await page.locator('.hero-copy').boundingBox()
    const circuit = await page.locator('.dashboard-circuit').boundingBox()
    const stage = await page
      .locator('.dashboard-circuit .circuit-stage')
      .boundingBox()
    const hero = await page.locator('.dashboard-hero').boundingBox()
    if (width <= 700)
      expect(copy!.y + copy!.height).toBeLessThanOrEqual(circuit!.y)
    else expect(copy!.x + copy!.width).toBeLessThanOrEqual(circuit!.x)
    expect(stage!.x).toBeGreaterThanOrEqual(hero!.x)
    expect(stage!.x + stage!.width).toBeLessThanOrEqual(hero!.x + hero!.width)
    for (const control of await page
      .locator('.dashboard-circuit button')
      .all()) {
      const box = await control.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  }
})

test('dashboard keeps learning controls available when 3D visualisation is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [1], visited: [1] },
        },
      }),
    )
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith('webgl')) return null
      return original.apply(this, args)
    } as typeof original
  })
  await page.goto('/')
  const circuit = page.locator('.dashboard-circuit')
  await expect(
    circuit.getByRole('status').filter({ hasText: /belum didukung/i }),
  ).toBeVisible()
  await expect(page.locator('.header-xp')).toHaveCount(0)
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByRole('heading', { name: 'Arus Listrik' }),
  ).toBeVisible()
})
