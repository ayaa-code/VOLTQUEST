import { test, expect } from '@playwright/test'
import { lessons } from '../src/data/lessons'
import { lessonSummaries } from '../src/data/lessonSummaries'
import { learningAccess } from '../src/data/learningAccess'
import { explanationNeedsRevision } from '../src/data/reflectionReview'
import { prepareMission } from './helpers/phet-mission'
import type { ProfileLearning } from '../src/hooks/useDynamicLearning'

test('summaries, video, ordered gates and honest local review', () => {
  expect(lessons[3].videoId).toBe('dLDgOag5qcc')
  expect(lessons[3].videoNotice).toBeUndefined()
  for (const points of Object.values(lessonSummaries))
    expect(points.length).toBeGreaterThanOrEqual(5)
  for (const text of ['ga tau', 'gatau', 'tidak tahu', '!!!', 'qwerty'])
    expect(explanationNeedsRevision(text)).toBe(true)
  expect(
    explanationNeedsRevision(
      'Saya mengamati lampu saat sakelar berubah posisi.',
    ),
  ).toBe(false)
  const base: ProfileLearning = {
    materials: [1, 2, 3, 4, 5, 6],
    quizzes: {},
    challenges: [],
    challengeDrafts: {},
    summative: { answers: {}, essays: ['', ''], submitted: false },
  }
  expect(
    [1, 3, 2, 4, 5].map((id) => learningAccess(base).missionReady(id)),
  ).toEqual([true, false, false, false, false])
  const ready = {
    ...base,
    questions: {
      'phet:1': { wrong: 0, status: 'correct' as const },
      'phet:3': { wrong: 4, status: 'reinforcement' as const },
    },
  }
  expect(learningAccess(ready).missionReady(2)).toBe(true)
  expect(learningAccess(ready).missionReady(4)).toBe(false)
  expect(learningAccess(ready, 'demo:admin').missionReady(5)).toBe(true)
})

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
  await page.addInitScript(() => {
    if (!localStorage.getItem('voltquest.v1'))
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: 'demo:admin',
          profiles: {
            'demo:admin': { name: 'Admin', completed: [], visited: [] },
          },
        }),
      )
  })
})

test('free prediction and review persist; weak explanation never claims full understanding', async ({
  page,
}, info) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Your Missions' }),
  ).toBeVisible()
  await expect(page.locator('.worksheet')).toHaveCount(0)
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `tmp/discovery-${info.project.name}-${width}.png`,
        fullPage: true, animations: 'disabled',
      })
  }
  await page.screenshot({
    path: `tmp/discovery-${info.project.name}.png`,
    fullPage: true, animations: 'disabled',
  })
  await page
    .getByRole('button', { name: 'Komponen Rangkaian', exact: true })
    .click()
  await expect(
    page.getByText('Ini perkiraan awal, bukan tes.', { exact: false }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('radio', { name: 'Belum yakin', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('radio', { name: 'Prediksi lain', exact: true }).check()
  await page
    .locator('#prediction-reason')
    .fill('Saya ingin menguji dugaan melalui pengamatan.')
  await page.locator('#prediction-text').fill('   ')
  await expect(
    page.getByRole('button', { name: 'Lanjut ke eksperimen', exact: true }),
  ).toBeDisabled()
  await prepareMission(page)
  await page.locator('#reflection-reason').fill('ga tau')
  await page.getByRole('radio', { name: /^B / }).check()
  await page.getByRole('button', { name: 'Kirim jawaban', exact: true }).click()
  const note = page.getByRole('region', { name: 'Catatan Pemahaman' })
  await expect(note).toContainText('perlu penguatan')
  await expect(page.locator('.feedback')).toContainText(
    'Pilihan jawabanmu tepat.',
  )
  await expect(page.locator('.feedback')).not.toContainText('Jawaban benar.')
  const before = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
        .profiles['demo:admin'].questions['phet:1'],
  )
  expect(before.status).toBe('reinforcement')
  expect(before.wrong).toBe(0)
  await page.reload()
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Komponen Rangkaian', exact: true })
    .click()
  await expect(note).toContainText('perlu penguatan')
  await expect(page.locator('.draft-summary').first()).toContainText(
    'Saya menduga perubahan susunan rangkaian',
  )
  await page
    .getByRole('button', { name: 'Revisi penjelasan', exact: true })
    .click()
  await page
    .locator('#reflection-reason')
    .fill(
      'Saya membandingkan hasil saat sakelar dibuka dan ditutup dengan perubahan keadaan lampu.',
    )
  await expect(note).toContainText('belum diperbarui')
  await page.getByRole('button', { name: 'Kirim jawaban', exact: true }).click()
  await expect(note).toContainText('belum dinilai secara makna')
  await expect(note).not.toContainText('belum diperbarui')
  await page.screenshot({
    path: `tmp/reflection-${info.project.name}.png`,
    fullPage: true, animations: 'disabled',
  })
  const after = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
        .profiles['demo:admin'].questions['phet:1'],
  )
  expect(after.wrong).toBe(0)
})

test('revising only explanation does not count another wrong choice', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Komponen Rangkaian', exact: true })
    .click()
  await prepareMission(page)
  await page.getByRole('radio', { name: /^A / }).check()
  await page.getByRole('button', { name: 'Kirim jawaban', exact: true }).click()
  await expect(page.locator('.feedback.retry')).toBeVisible()
  await page
    .getByRole('button', { name: 'Revisi penjelasan', exact: true })
    .click()
  await page
    .locator('#reflection-reason')
    .fill(
      'Saya perlu meninjau data dan menjelaskan kembali hubungan komponen dengan hasil pengamatan.',
    )
  await page.getByRole('button', { name: 'Kirim jawaban', exact: true }).click()
  await expect(page.locator('.feedback.retry')).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
          .profiles['demo:admin'].questions['phet:1'].wrong,
    ),
  ).toBe(1)
})
