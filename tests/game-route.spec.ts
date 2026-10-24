import { test, expect } from '@playwright/test'
import { playToGate } from './game-helpers'
test('physical route', async ({ page }, testInfo) => {
  test.setTimeout(90000)
  await page.addInitScript(() => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [], visited: [] },
        },
      }),
    )
    localStorage.setItem(
      'voltquest.dynamic-electricity.v1',
      JSON.stringify({
        version: 1,
        profiles: {
          'student:nara': {
            materials: [1],
            challenges: [],
            challengeDrafts: {},
            quizzes: {},
            summative: { answers: {}, essays: [], submitted: false },
          },
        },
      }),
    )
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await page.getByRole('button', { name: 'Formatif 1: Arus Listrik' }).click()
  await page.locator('.cq-canvas').waitFor()
  await expect(page.locator('.cq-canvas')).toHaveAttribute(
    'data-grounded',
    'true',
  )
  await page
    .locator('.cq-container')
    .screenshot({ path: `tmp/nature-game-${testInfo.project.name}.png` })
  for (const [index, key] of ['B', 'D', 'D'].entries()) {
    await playToGate(page)
    if (index === 0)
      await page
        .locator('.cq-stage-wrapper')
        .screenshot({
          path: `tmp/nature-question-${testInfo.project.name}.png`,
        })
    await page
      .locator('.cq-option-btn')
      .filter({
        has: page.locator('.cq-option-key', { hasText: key, exact: true }),
      })
      .click()
    await page
      .getByRole('button', {
        name:
          index < 2 ? 'Lanjut ke Misi Berikutnya' : 'Selesaikan Pengisian Accu',
        exact: true,
      })
      .click()
  }
  await expect(
    page.getByText('Accu Berhasil Diisi!', { exact: true }),
  ).toBeVisible()
})
