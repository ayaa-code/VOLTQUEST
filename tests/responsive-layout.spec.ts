import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
})

test('login fits laptop viewport heights and adapts immediately on resize', async ({
  page,
}) => {
  await page.goto('/')
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
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    ).toBe(true)
    const form = await page.locator('.auth-card').boundingBox()
    expect(form!.y).toBeGreaterThanOrEqual(0)
    expect(form!.y + form!.height).toBeLessThanOrEqual(height)
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

test('dashboard primary action fits laptop and all mission content stays accessible', async ({
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
    await expect(
      page.getByRole('button', { name: 'Mulai misi pertama' }),
    ).toBeInViewport()
  }
  await page.getByRole('button', { name: 'Mulai misi pertama' }).click()
  await expect(
    page.getByRole('radio', { name: 'Belum yakin', exact: true }),
  ).toBeVisible()
})
