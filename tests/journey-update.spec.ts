import { test, expect, type Page } from '@playwright/test'
import { recordAnswer, passedQuestion } from '../src/data/attempts'
import { learningAccess } from '../src/data/learningAccess'
import { prepareMission } from './helpers/phet-mission'
import { finishCurrentGame, playToGate } from './game-helpers'
import type { ProfileLearning } from '../src/hooks/useDynamicLearning'
const profile = {
  active: 'student:nara',
  profiles: { 'student:nara': { name: 'Nara', completed: [], visited: [] } },
}
test.beforeEach(async ({ page }) => {
  test.setTimeout(150000)
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
  await page.addInitScript((p) => {
    if (!localStorage.getItem('voltquest.v1'))
      localStorage.setItem('voltquest.v1', JSON.stringify(p))
  }, profile)
})
test('attempt semantics and prerequisite ordering distinguish correctness and support', () => {
  let q = recordAnswer(undefined, 'a', false, 1000)!
  expect(recordAnswer(q, 'a', false, 1100)).toBeNull()
  for (let i = 2; i <= 4; i++) q = recordAnswer(q, 'a', false, 1000 * i)!
  expect(q.wrong).toBe(4)
  expect(passedQuestion(q)).toBe(false)
  q = { ...q, status: 'reinforcement' }
  expect(passedQuestion(q)).toBe(true)
  expect(recordAnswer(q, 'b', true, 6000)?.status).toBe('correct')
  const base: ProfileLearning = {
    materials: [1, 2, 3],
    quizzes: {},
    challenges: [],
    challengeDrafts: {},
    summative: { answers: {}, essays: ['', ''], submitted: false },
  }
  expect(learningAccess(base).quizReady(1)).toBe(false)
  expect(learningAccess(base).missionReady(1)).toBe(true)
  expect(learningAccess(base).missionReady(2)).toBe(false)
  const ready = { ...base, questions: { 'phet:1': q, 'phet:3': q } }
  expect(learningAccess(ready).quizReady(1)).toBe(true)
  expect(learningAccess(ready).summativeReady).toBe(false)
})
async function seed(page: Page, learning: unknown, admin = false) {
  await page.addInitScript(
    ({ learning, admin }) => {
      if (admin && !localStorage.getItem('voltquest.dynamic-electricity.v1'))
        localStorage.setItem(
          'voltquest.v1',
          JSON.stringify({
            active: 'demo:admin',
            profiles: {
              'demo:admin': { name: 'Admin', completed: [], visited: [] },
            },
          }),
        )
      if (!localStorage.getItem('voltquest.dynamic-electricity.v1'))
        localStorage.setItem(
          'voltquest.dynamic-electricity.v1',
          JSON.stringify({
            version: 1,
            profiles: { [admin ? 'demo:admin' : 'student:nara']: learning },
          }),
        )
    },
    { learning, admin },
  )
}
const blank = {
  materials: [],
  quizzes: {},
  challenges: [],
  challengeDrafts: {},
  summative: { answers: {}, essays: ['', ''], submitted: false },
}
test('desktop and mobile progress show identical journey without mutating data', async ({
  page,
}, info) => {
  await seed(page, { ...blank, materials: [1, 2, 3] })
  await page.goto('/')
  const before = await page.evaluate(() =>
    localStorage.getItem('voltquest.dynamic-electricity.v1'),
  )
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 })
    const progress = page
      .getByRole('button', { name: 'Progres', exact: true })
      .filter({ visible: true })
    await progress.click()
    await expect(progress).toHaveAttribute('aria-current', 'page')
    await expect(
      page.getByRole('progressbar', { name: 'Progres Listrik Dinamis' }),
    ).toHaveAttribute('aria-valuenow', '3')
    await expect(page.locator('.hero-copy')).toHaveCount(0)
    await expect(page.locator('.learning-progress')).toContainText('Formatif 1')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if ([1440, 390].includes(width)) {
      await page.waitForTimeout(400)
      await page.screenshot({
        path: `tmp/journey-progress-${info.project.name}-${width}.png`,
        fullPage: true,
      })
    }
  }
  expect(
    await page.evaluate(() =>
      localStorage.getItem('voltquest.dynamic-electricity.v1'),
    ),
  ).toBe(before)
  await page
    .getByRole('button', { name: 'Jelajah', exact: true })
    .filter({ visible: true })
    .click()
  await expect(page.locator('.hero-copy')).toBeVisible()
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Seri dan Paralel', exact: true }),
  ).toBeDisabled()
  await expect(page.locator('.worksheet-template')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Your Missions' })).toBeVisible()
})
test('required PhET missions unlock Piko then six materials and second checkpoint lead to summative', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Explore Lessons', exact: true })
    .click()
  await page.getByRole('button', { name: 'Arus Listrik', exact: true }).click()
  for (const next of [
    'Lanjut ke materi berikutnya',
    'Lanjut ke materi berikutnya',
    'Mulai Misi Discovery Lab',
  ]) {
    await page
      .getByRole('button', { name: 'Tandai sudah dipelajari', exact: true })
      .click()
    await page.getByRole('button', { name: next, exact: true }).click()
  }
  await page
    .getByRole('button', { name: 'Komponen Rangkaian', exact: true })
    .click()
  await prepareMission(page)
  await page.getByRole('radio', { name: 'B Baterai', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban', exact: true }).click()
  await page
    .getByRole('button', { name: 'Lanjut ke misi berikutnya', exact: true })
    .click()
  await prepareMission(page)
  await page.getByRole('radio', { name: 'D 6 Ω', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban', exact: true }).click()
  await page
    .getByRole('button', { name: 'Lanjut ke misi berikutnya', exact: true })
    .click()
  await finishCurrentGame(page)
  await page
    .getByRole('button', {
      name: 'Lanjut ke Rangkaian Listrik Seri dan Paralel',
      exact: true,
    })
    .click()
  for (const next of [
    'Lanjut ke materi berikutnya',
    'Lanjut ke materi berikutnya',
    'Kerjakan Formative Checkpoint 2',
  ]) {
    await page
      .getByRole('button', { name: 'Tandai sudah dipelajari', exact: true })
      .click()
    await page.getByRole('button', { name: next, exact: true }).click()
  }
  for (const [i, values] of [
    ['1.5', '6', '1'],
    ['4.5', 'keluar'],
    ['153'],
  ].entries()) {
    for (const [j, input] of (
      await page.locator('.energy-inputs input').all()
    ).entries())
      await input.fill(values[j])
    if (i === 1)
      await page.getByLabel('Arah I5', { exact: true }).selectOption('keluar')
    await page
      .getByRole('button', { name: 'Check System', exact: true })
      .click()
    await page
      .getByRole('button', {
        name: i < 2 ? 'Continue to Next Mission' : 'Complete Checkpoint',
        exact: true,
      })
      .click()
  }
  await page
    .getByRole('button', { name: 'Kerjakan Asesmen Sumatif', exact: true })
    .click()
  await expect(page.locator('.summative-detail')).toBeVisible()
})
test('four wrong energy submissions persist, do not leak answers, allow support and later correction', async ({
  page,
}) => {
  await seed(page, blank, true)
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 2', exact: true })
    .click()
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
          .profiles['demo:admin'].questions,
    ),
  ).toBeUndefined()
  for (const [name, value] of [
    ['Arus utama (A)', '9'],
    ['Tegangan R3 (V)', '9'],
    ['Arus R1 (A)', '9'],
  ])
    await page.getByLabel(name, { exact: true }).fill(value)
  for (let i = 1; i <= 4; i++) {
    if (i > 1) await page.waitForTimeout(950)
    const response = page.waitForResponse('**/api/assessment')
    if (i === 1)
      await page
        .getByRole('button', { name: 'Check System', exact: true })
        .dblclick()
    else
      await page
        .getByRole('button', { name: 'Check System', exact: true })
        .click()
    expect((await (await response).json()).explanation).toBeUndefined()
    await expect(page.locator('.quiz-feedback')).not.toContainText('1,5 A')
    await expect(
      page.getByRole('button', {
        name: 'Lanjut dengan penguatan',
        exact: true,
      }),
    ).toHaveCount(i === 4 ? 1 : 0)
  }
  await page.reload()
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 2', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut dengan penguatan', exact: true })
    .click()
  await expect(page.locator('.energy-success')).toContainText('Perlu penguatan')
  await page
    .getByRole('button', { name: 'Continue to Next Mission', exact: true })
    .click()
  const state = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
        .profiles['demo:admin'],
  )
  expect(state.questions['energy:1']).toMatchObject({
    wrong: 4,
    status: 'reinforcement',
  })
  expect(state.checkpoints[2].solved).toEqual([])
  await page
    .getByRole('button', { name: 'Tinjau · Perlu penguatan', exact: true })
    .click()
  for (const [name, value] of [
    ['Arus utama (A)', '1.5'],
    ['Tegangan R3 (V)', '6'],
    ['Arus R1 (A)', '1'],
  ])
    await page.getByLabel(name, { exact: true }).fill(value)
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await expect(page.locator('.energy-success')).toContainText('Jawaban benar')
})
test('Piko supports four mistakes without revealing key or consuming obstacle lives', async ({
  page,
}) => {
  await seed(page, blank, true)
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 1', exact: true })
    .click()
  await playToGate(page)
  for (let i = 1; i <= 4; i++) {
    if (i > 1) await page.waitForTimeout(950)
    await page.locator('.cq-option-btn').first().click()
    await expect(
      page.locator('.cq-feedback-box[role=status]'),
    ).not.toContainText('18.000')
    await expect(
      page.getByRole('button', {
        name: 'Lanjut dengan penguatan',
        exact: true,
      }),
    ).toHaveCount(i === 4 ? 1 : 0)
  }
  await page
    .getByRole('button', { name: 'Lanjut dengan penguatan', exact: true })
    .click()
  await expect(
    page.getByText(
      'Perlu penguatan. Kamu boleh melanjutkan atau mencoba lagi.',
    ),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Lanjut ke Misi Berikutnya', exact: true })
    .click()
  await expect(page.locator('.cq-topbar-left')).toContainText('Misi 2')
})
test('PhET mistakes persist across reload and supported completion grants no XP', async ({
  page,
}) => {
  await seed(page, blank, true)
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await page.getByRole('button', { name: 'Hukum Ohm', exact: true }).click()
  await prepareMission(page)
  await page.getByRole('radio', { name: 'A 24 Ω', exact: true }).check()
  for (let i = 1; i <= 4; i++) {
    if (i > 1) await page.waitForTimeout(950)
    await page
      .getByRole('button', {
        name: i === 1 ? 'Kirim jawaban' : 'Coba jawaban lagi',
        exact: true,
      })
      .click()
    await expect(page.locator('.feedback.retry')).not.toContainText('6 Ω')
    await expect(
      page.getByRole('button', {
        name: 'Lanjut dengan penguatan',
        exact: true,
      }),
    ).toHaveCount(i === 4 ? 1 : 0)
  }
  await page.reload()
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await page.getByRole('button', { name: 'Hukum Ohm', exact: true }).click()
  await page
    .getByRole('button', { name: 'Lanjut dengan penguatan', exact: true })
    .click()
  await expect(page.getByText('Perlu penguatan', { exact: true })).toBeVisible()
  const state = await page.evaluate(() => ({
    learning: JSON.parse(
      localStorage.getItem('voltquest.dynamic-electricity.v1')!,
    ).profiles['demo:admin'],
    progress: JSON.parse(localStorage.getItem('voltquest.v1')!).profiles[
      'demo:admin'
    ],
  }))
  expect(state.learning.questions['phet:3']).toMatchObject({
    wrong: 4,
    status: 'reinforcement',
  })
  expect(state.progress.completed).toEqual([])
  await page
    .getByRole('button', { name: 'Lanjut ke tahap berikutnya', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Formative Checkpoint 1', exact: true }),
  ).toBeVisible()
})
test('legacy mission completion migrates once and preserves other profiles and summative access', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('migration-seeded')) {
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: 'student:nara',
          profiles: {
            'student:nara': {
              name: 'Nara',
              completed: [1, 3],
              visited: [1, 3],
            },
            'student:other': { name: 'Other', completed: [], visited: [] },
          },
        }),
      )
      localStorage.setItem(
        'voltquest.dynamic-electricity.v1',
        JSON.stringify({
          version: 1,
          profiles: {
            'student:nara': {
              materials: [1, 2, 3],
              quizzes: {},
              challenges: [],
              challengeDrafts: {},
              summative: { answers: {}, essays: ['', ''], submitted: true },
            },
            'student:other': {
              materials: [],
              quizzes: {},
              challenges: [],
              challengeDrafts: {},
              summative: { answers: {}, essays: ['', ''], submitted: false },
            },
          },
        }),
      )
      localStorage.setItem('migration-seeded', 'yes')
    }
  })
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Sumatif Listrik Dinamis', exact: true }),
  ).toBeEnabled()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 1', exact: true })
    .click()
  await playToGate(page)
  await page.locator('.cq-option-btn').first().click()
  const getState = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
    )
  await expect
    .poll(
      async () =>
        (await getState()).profiles['student:nara'].questions?.['piko:1']
          ?.wrong,
    )
    .toBe(1)
  const before = await getState()
  expect(before.profiles['student:nara'].questions['phet:1']).toEqual({
    wrong: 0,
    status: 'correct',
  })
  expect(before.profiles['student:nara'].questions['phet:3']).toEqual({
    wrong: 0,
    status: 'correct',
  })
  await page.reload()
  await page
    .getByRole('button', { name: 'Progres', exact: true })
    .filter({ visible: true })
    .click()
  expect((await getState()).profiles['student:nara'].questions).toEqual(
    before.profiles['student:nara'].questions,
  )
  expect((await getState()).profiles['student:other'].materials).toEqual([])
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.v1')!).profiles[
          'student:nara'
        ].completed,
    ),
  ).toEqual([1, 3])
})
