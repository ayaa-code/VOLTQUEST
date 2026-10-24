import { test, expect } from '@playwright/test'
import { finishCurrentGame, playToGate } from './game-helpers'
test.beforeEach(async ({ page }) => {
  test.setTimeout(120000)
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
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
            summative: { submitted: false, answers: {}, essays: [] },
          },
          'student:bima': {
            materials: [],
            challenges: [],
            challengeDrafts: {},
            quizzes: {},
            summative: { submitted: false, answers: {}, essays: [] },
          },
        },
      }),
    )
  })
})
async function enter(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await page.getByRole('button', { name: 'Formatif 1: Arus Listrik' }).click()
  await page.locator('.cq-container').waitFor()
}
test('three game questions unlock next lesson, persist separately, and preserve XP', async ({
  page,
}) => {
  await page.goto('/')
  await enter(page)
  await playToGate(page)
  await page.locator('.cq-option-btn').first().click()
  await expect(page.locator('.cq-feedback-box[role=status]')).toContainText(
    'Belum tepat, mari revisi.',
  )
  await expect(
    page.getByRole('button', { name: 'Lanjut ke materi berikutnya' }),
  ).toHaveCount(0)
  await finishCurrentGame(page)
  await expect(
    page.getByText('Accu Berhasil Diisi!', { exact: true }),
  ).toBeVisible()
  const result = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
  )
  expect(result.profiles['student:nara'].quizzes[1].game.solved).toEqual([
    1, 2, 3,
  ])
  expect(result.profiles['student:nara'].quizzes[1].complete).toBeTruthy()
  expect(result.profiles['student:bima'].quizzes).toEqual({})
  await expect(page.locator('.header-xp')).toContainText('0')
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy()
  }
  await page
    .getByRole('button', { name: 'Lanjut ke materi berikutnya' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Hambatan Ohmik dan Non-Ohmik' }),
  ).toBeVisible()
})
test('canvas keyboard and touch controls work; mission answers resume after returning', async ({
  page,
}) => {
  await page.goto('/')
  await enter(page)
  const canvas = page.locator('.cq-canvas')
  await expect(
    page.getByText('Ingat kembali materinya', { exact: true }),
  ).toHaveCount(0)
  const before = await canvas.evaluate((el) =>
    (el as HTMLCanvasElement).toDataURL(),
  )
  await page.keyboard.down('ArrowRight')
  await page.waitForTimeout(350)
  await page.keyboard.up('ArrowRight')
  expect(
    await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL()),
  ).not.toBe(before)
  await playToGate(page)
  await page.locator('.cq-option-btn').nth(1).click()
  await page.getByRole('button', { name: 'Lanjut ke Misi Berikutnya' }).click()
  await playToGate(page)
  await page.locator('.cq-option-btn').first().click()
  await page.getByRole('button', { name: 'Pelajari kembali materi' }).click()
  await page.getByRole('button', { name: 'Kerjakan Tes Formatif' }).click()
  await expect(page.locator('.cq-topbar-left')).toContainText('Misi 2')
  const right = page.getByRole('button', { name: 'Gerak Kanan' }),
    jump = page.getByRole('button', { name: 'Lompat' })
  if (await right.isVisible()) {
    await right.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    const r = await right.boundingBox(),
      j = await jump.boundingBox()
    const session = await page.context().newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { id: 1, x: r!.x + 20, y: r!.y + 20 },
        { id: 2, x: j!.x + 20, y: j!.y + 20 },
      ],
    })
    await expect(right).toHaveClass(/cq-ctrl-active/)
    await expect(jump).toHaveClass(/cq-ctrl-active/)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchCancel',
      touchPoints: [],
    })
    await expect(right).not.toHaveClass(/cq-ctrl-active/)
    await expect(jump).not.toHaveClass(/cq-ctrl-active/)
    await session.detach()
  } else await expect(right).toBeHidden()
})
