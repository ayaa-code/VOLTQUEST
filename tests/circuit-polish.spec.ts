import { expect, test } from '@playwright/test'

test('component labels follow the 3D circuit without overlapping controls', async ({
  page,
}) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('canvas')).toHaveCount(0)
  for (const variant of ['dashboard']) {
    if (variant === 'dashboard') {
      await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
      await page.getByRole('button', { name: 'Masuk', exact: true }).click()
      await expect(page.locator('.dashboard')).toBeVisible()
    }
    const circuit = page.locator(`.${variant}-circuit`)
    await expect(circuit).toHaveAttribute('data-renderer', '3d')
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1024, 600],
      [1440, 800],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height })
      await circuit.scrollIntoViewIfNeeded()
      const sizes = await circuit.evaluate((element) => {
        const controls = element
          .querySelector('.circuit-controls')!
          .getBoundingClientRect()
        const stage = element
          .querySelector('.circuit-stage')!
          .getBoundingClientRect()
        const labels = Array.from(
          element.querySelectorAll('.circuit-label'),
        ).map((label) => {
          const r = label.getBoundingClientRect()
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            text: label.textContent,
          }
        })
        return {
          controlsTop: controls.top,
          left: stage.left,
          right: stage.right,
          top: stage.top,
          bottom: stage.bottom,
          labels,
        }
      })
      expect(sizes.labels.map((label) => label.text)).toEqual([
        'Baterai',
        'Saklar',
        'Resistor',
        'Lampu',
      ])
      for (const label of sizes.labels) {
        expect(label.left).toBeGreaterThanOrEqual(sizes.left - 1)
        expect(label.right).toBeLessThanOrEqual(sizes.right + 1)
        expect(label.top).toBeGreaterThanOrEqual(sizes.top - 1)
        expect(label.bottom).toBeLessThanOrEqual(sizes.bottom + 1)
        expect(label.bottom).toBeLessThanOrEqual(sizes.controlsTop + 1)
      }
      for (const [index, label] of sizes.labels.entries()) {
        for (const other of sizes.labels.slice(index + 1)) {
          const overlaps =
            label.left < other.right &&
            label.right > other.left &&
            label.top < other.bottom &&
            label.bottom > other.top
          expect(overlaps).toBe(false)
        }
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
    }
    await circuit.getByRole('switch').click()
    await expect(circuit.getByRole('img')).toHaveAccessibleName(/lampu mati/)
    await circuit.getByRole('switch').click()
    await expect(circuit.getByRole('img')).toHaveAccessibleName(/lampu menyala/)
  }
})
