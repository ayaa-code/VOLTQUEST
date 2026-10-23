import { expect, test } from '@playwright/test'

test('component legend stays outside both renderers and above controls on login and dashboard', async ({
  page,
}) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const variant of ['login', 'dashboard']) {
    if (variant === 'dashboard') {
      await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
      await page.getByRole('button', { name: 'Masuk', exact: true }).click()
      await expect(page.locator('.dashboard')).toBeVisible()
    }
    const circuit = page.locator(`.${variant}-circuit`)
    await expect(circuit).toHaveAttribute('data-renderer', '3d')
    for (const renderer of ['3d', 'svg']) {
      if (renderer === 'svg')
        await circuit
          .getByRole('button', { name: 'Gunakan tampilan ringan' })
          .click()
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
          const image = element
            .querySelector('canvas, .login-circuit-svg')!
            .getBoundingClientRect()
          const legend = element
            .querySelector('.circuit-legend')!
            .getBoundingClientRect()
          const controls = element
            .querySelector('.circuit-controls')!
            .getBoundingClientRect()
          const band = element
            .querySelector('.circuit-stage')!
            .getBoundingClientRect()
          const labels = Array.from(
            element.querySelectorAll('.circuit-legend span'),
          ).map((label) => {
            const r = label.getBoundingClientRect()
            return { left: r.left, right: r.right, text: label.textContent }
          })
          return {
            imageBottom: image.bottom,
            legendTop: legend.top,
            legendBottom: legend.bottom,
            controlsTop: controls.top,
            left: band.left,
            right: band.right,
            labels,
          }
        })
        expect(sizes.legendTop).toBeGreaterThanOrEqual(sizes.imageBottom - 1)
        expect(sizes.controlsTop).toBeGreaterThanOrEqual(sizes.legendBottom - 1)
        expect(sizes.labels.map((label) => label.text)).toEqual([
          'Baterai',
          'Saklar',
          'Resistor',
          'Lampu',
        ])
        for (const label of sizes.labels) {
          expect(label.left).toBeGreaterThanOrEqual(sizes.left)
          expect(label.right).toBeLessThanOrEqual(sizes.right)
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true)
      }
      await circuit.getByRole('switch').click()
      await expect(circuit.getByRole('img')).toHaveAccessibleName(/lampu mati/)
      if (renderer === 'svg') {
        await expect(circuit.locator('.fallback-current')).toHaveCount(0)
        await circuit
          .locator('.login-circuit-svg rect[fill="transparent"]')
          .click()
      } else await circuit.getByRole('switch').click()
      await expect(circuit.getByRole('img')).toHaveAccessibleName(
        /lampu menyala/,
      )
    }
  }
})
