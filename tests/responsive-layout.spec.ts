import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
})

test('login stays centered, has no 3D renderer, and adapts to viewport height', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.electric-visual')).toHaveCount(0)
  for (const [width, height] of [
    [1920, 900],
    [1536, 730],
    [1440, 800],
    [1366, 650],
    [1280, 620],
    [1024, 600],
    [900, 720],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => scrollTo(0, 0))
    const form = await page.locator('.auth-card').boundingBox()
    expect(form!.y).toBeGreaterThanOrEqual(0)
    expect(Math.abs(form!.x + form!.width / 2 - width / 2)).toBeLessThanOrEqual(
      1,
    )
    if (form!.height + 32 <= height)
      expect(
        Math.abs(form!.y + form!.height / 2 - height / 2),
      ).toBeLessThanOrEqual(1)
    await page.locator('.electric-class').scrollIntoViewIfNeeded()
    await expect(page.locator('.electric-class')).toBeInViewport()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})

test('short screens, larger text and validation keep all login controls reachable', async ({
  page,
}) => {
  await page.goto('/')
  for (const [width, height] of [
    [390, 844],
    [360, 800],
    [320, 568],
    [844, 390],
    [390, 400],
  ]) {
    await page.setViewportSize({ width, height })
    await page.locator('.auth-submit').scrollIntoViewIfNeeded()
    await expect(page.locator('.auth-submit')).toBeInViewport()
    await expect(page.locator('.auth-submit')).toBeEnabled()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await page.setViewportSize({ width: 800, height: 500 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await expect(page.getByLabel('Siapa nama panggilanmu?')).toBeFocused()
  await expect(page.getByText('Tulis nama panggilanmu.')).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('nara@example.test')
  await page.getByLabel('Kata sandi', { exact: true }).fill('Contoh1234')
  await page.locator('.auth-submit').scrollIntoViewIfNeeded()
  await expect(page.locator('.auth-submit')).toBeInViewport()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('dashboard keeps its three cards and next step accessible below the welcome banner', async ({
  page,
}) => {
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
  await page.goto('/')
  for (const [width, height] of [
    [1366, 650],
    [1024, 600],
    [768, 1024],
    [390, 844],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => scrollTo(0, 0))
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await expect(page.locator('.learning-path-card')).toHaveCount(3)
    await expect(
      page.locator('.learning-hero button.primary-button'),
    ).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Buka tahap berikutnya' })
      .scrollIntoViewIfNeeded()
    await expect(
      page.getByRole('button', { name: 'Buka tahap berikutnya' }),
    ).toBeInViewport()
  }
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByRole('heading', { name: 'Arus Listrik' }),
  ).toBeVisible()
})
