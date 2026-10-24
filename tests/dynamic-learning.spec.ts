import { expect, test } from '@playwright/test'
test('a new learner advances through three materials before checkpoint one', async ({
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
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Formative Checkpoint 1', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Formative Checkpoint 2', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Kembali ke Listrik Dinamis', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Explore Lessons', exact: true })
    .click()
  await page.getByRole('button', { name: 'Arus Listrik', exact: true }).click()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await page
    .getByRole('button', { name: 'Lanjut ke materi berikutnya', exact: true })
    .click()
  await expect(
    page.getByRole('heading', {
      name: 'Hambatan Ohmik dan Non-Ohmik',
      exact: true,
    }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await page
    .getByRole('button', { name: 'Lanjut ke materi berikutnya', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Hambatan Jenis', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await page
    .getByRole('button', {
      name: 'Kerjakan Formative Checkpoint 1',
      exact: true,
    })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Formative Checkpoint 1', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.header-xp')).toContainText('0')
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
  )
  expect(state.profiles['student:nara'].materials).toEqual([1, 2, 3])
  expect(state.profiles['student:nara'].quizzes).toEqual({})
})
