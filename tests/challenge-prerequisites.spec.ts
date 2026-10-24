import { expect, test } from '@playwright/test'

test('six sequential challenges are required for summative and saved analyses remain intact', async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  const original = {
    version: 1,
    profiles: {
      'student:nara': {
        materials: [1, 2, 3, 4, 5, 6],
        quizzes: Object.fromEntries(
          [1, 2, 3, 4, 5, 6].map((id) => [
            id,
            { answer: 'benar', attempts: 1, complete: true },
          ]),
        ),
        challenges: [],
        challengeDrafts: Object.fromEntries(
          [1, 2, 3, 4, 5, 6].map((id) => [
            id,
            {
              visited: true,
              observation: `Pengamatan sebelumnya ${id}`,
              reflection: `Analisis sebelumnya ${id}`,
            },
          ]),
        ),
        summative: { answers: {}, essays: ['', ''], submitted: false },
      },
      'student:bima': {
        materials: [1],
        challenges: [],
        challengeDrafts: {},
        quizzes: {},
        summative: { answers: {}, essays: ['', ''], submitted: false },
      },
    },
  }
  await page.addInitScript((saved) => {
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
      JSON.stringify(saved),
    )
  }, original)
  await page.goto('/')
  for (let id = 1; id <= 6; id++) {
    await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
    await expect(
      page.getByRole('button', { name: 'Sumatif Listrik Dinamis' }),
    ).toBeDisabled()
    await page
      .getByRole('button', { name: 'Kembali ke Listrik Dinamis' })
      .click()
    await page.getByRole('button', { name: 'Start Challenge' }).click()
    const row = page.getByRole('button', {
      name: new RegExp(`^Challenge ${id}:`),
    })
    await expect(row).toBeEnabled()
    if (id < 6)
      await expect(
        page.getByRole('button', { name: new RegExp(`^Challenge ${id + 1}:`) }),
      ).toBeDisabled()
    await row.click()
    await expect(page.getByRole('textbox').first()).toHaveValue(
      `Pengamatan sebelumnya ${id}`,
    )
    await page.getByRole('button', { name: 'Selesaikan challenge' }).click()
    await expect(
      page.getByText('Challenge selesai. Catatanmu tersimpan.'),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Kembali ke progres' }).click()
  }
  await expect(
    page.locator('.mission-path-challenge .mission-step.done'),
  ).toHaveCount(6)
  await expect(
    page.locator('.mission-path-assessment .mission-step').last(),
  ).toHaveAttribute('aria-label', /Sumatif.*Ready to continue/)
  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await page.getByRole('button', { name: 'Sumatif Listrik Dinamis' }).click()
  await expect(page.getByText('ASESMEN SUMATIF', { exact: true })).toBeVisible()
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
  )
  expect(saved.profiles['student:nara'].challenges).toEqual([1, 2, 3, 4, 5, 6])
  expect(saved.profiles['student:nara'].challengeDrafts).toEqual(
    original.profiles['student:nara'].challengeDrafts,
  )
  expect(saved.profiles['student:bima']).toEqual(
    original.profiles['student:bima'],
  )
})

test('legacy completed summative remains reviewable without inventing missing prerequisites', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:old',
        profiles: {
          'student:old': { name: 'Old', completed: [], visited: [] },
        },
      }),
    )
    localStorage.setItem(
      'voltquest.dynamic-electricity.v1',
      JSON.stringify({
        version: 1,
        profiles: {
          'student:old': {
            materials: [],
            quizzes: {},
            challenges: [],
            challengeDrafts: {},
            summative: {
              answers: {},
              essays: ['Catatan lama', 'Jawaban lama'],
              submitted: true,
            },
          },
        },
      }),
    )
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await page.getByRole('button', { name: 'Sumatif Listrik Dinamis' }).click()
  await expect(page.getByText('ASESMEN SUMATIF', { exact: true })).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
          .profiles['student:old'].materials,
    ),
  ).toEqual([])
})
