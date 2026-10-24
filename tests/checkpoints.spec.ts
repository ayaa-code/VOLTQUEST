import { test, expect } from '@playwright/test'
import { finishCurrentGame, playToGate } from './game-helpers'
import { learningAccess } from '../src/data/learningAccess'
import {
  checkpointDone,
  numericAnswer,
  checkEnergyAnswer,
} from '../src/data/checkpoints'
import type { ProfileLearning } from '../src/hooks/useDynamicLearning'
test('prerequisites, legacy completion and numeric formats remain valid', () => {
  const base: ProfileLearning = {
    materials: [],
    quizzes: {},
    challenges: [],
    challengeDrafts: {},
    summative: { answers: {}, essays: ['', ''], submitted: false },
  }
  expect(learningAccess(base).quizReady(1)).toBe(false)
  const group = { ...base, materials: [1, 2, 3] }
  expect(learningAccess(group).quizReady(1)).toBe(true)
  expect(learningAccess(group).materialReady(4)).toBe(false)
  const partial = {
    ...group,
    quizzes: { 1: { answer: 'old', attempts: 1, complete: true } },
  }
  expect(checkpointDone(partial, 1)).toBe(false)
  const legacy = {
    ...group,
    quizzes: Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map((id) => [
        id,
        { answer: 'old', attempts: 1, complete: true },
      ]),
    ),
  }
  expect(checkpointDone(legacy, 1)).toBe(true)
  expect(checkpointDone(legacy, 2)).toBe(true)
  expect(learningAccess(legacy).materialReady(4)).toBe(true)
  expect(
    learningAccess({
      ...base,
      summative: { ...base.summative, submitted: true },
    }).summativeReady,
  ).toBe(true)
  expect(
    learningAccess({
      ...base,
      summative: { ...base.summative, submitted: true },
    }).challengeReady(1),
  ).toBe(true)
  expect(numericAnswer('18.000 C')).toBe(18000)
  expect(numericAnswer('1,5 A')).toBe(1.5)
  expect(checkEnergyAnswer(2, ['4,5', 'masuk'])).toBe(false)
  expect(checkEnergyAnswer(2, ['4,5', 'keluar'])).toBe(true)
  expect(checkEnergyAnswer(1, ['1,5', '6', '2'])).toBe(false)
})
const profile = {
  active: 'student:nara',
  profiles: { 'student:nara': { name: 'Nara', completed: [], visited: [] } },
}
test.beforeEach(async ({ page }) => {
  test.setTimeout(120000)
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.addInitScript(
    (p) => localStorage.setItem('voltquest.v1', JSON.stringify(p)),
    profile,
  )
})
test('three materials unlock Piko; all three topic missions unlock material four', async ({
  page,
}, info) => {
  await page.goto('/')
  for (const title of [
    'Arus Listrik',
    'Hambatan Ohmik dan Non-Ohmik',
    'Hambatan Jenis',
  ]) {
    await page
      .getByRole('button', { name: 'Explore Lessons', exact: true })
      .click()
    await page.getByRole('button', { name: title, exact: true }).click()
    await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
    await page
      .getByRole('button', { name: 'Kembali ke Listrik Dinamis', exact: true })
      .click()
  }
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 1', exact: true })
    .click()
  await page.waitForTimeout(600)
  await page.screenshot({
    path: `tmp/checkpoint-piko-${info.project.name}.png`,
    fullPage: true,
  })
  await playToGate(page)
  await page.locator('.cq-option-btn').first().click()
  await expect(page.locator('.cq-feedback-box[role=status]')).toContainText(
    '7.200',
  )
  await finishCurrentGame(page)
  await page
    .getByRole('button', {
      name: 'Lanjut ke Rangkaian Listrik Seri dan Paralel',
      exact: true,
    })
    .click()
  await expect(
    page.getByRole('heading', {
      name: 'Rangkaian Listrik Seri dan Paralel',
      exact: true,
    }),
  ).toBeVisible()
})
test('energy control room validates all fields, persists, unlocks challenge and fits five widths', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('voltquest.dynamic-electricity.v1'))
      localStorage.setItem(
        'voltquest.dynamic-electricity.v1',
        JSON.stringify({
          version: 1,
          profiles: {
            'student:nara': {
              materials: [1, 2, 3, 4, 5, 6],
              quizzes: {
                1: { complete: true },
                2: { complete: true },
                3: { complete: true },
              },
              challenges: [],
              challengeDrafts: {},
              summative: { answers: {}, essays: ['', ''], submitted: false },
            },
          },
        }),
      )
  })
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Sumatif Listrik Dinamis', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 2', exact: true })
    .click()
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 })
    await page.waitForTimeout(300)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy()
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `tmp/checkpoint-energy-${info.project.name}-${width}.png`,
        fullPage: true,
      })
  }
  await page.getByLabel('Arus utama (A)', { exact: true }).fill('2')
  await page.getByLabel('Tegangan R3 (V)', { exact: true }).fill('6')
  await page.getByLabel('Arus R1 (A)', { exact: true }).fill('1')
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Belum tepat')
  await page.getByLabel('Arus utama (A)', { exact: true }).fill('1,5')
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await page.reload()
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 2', exact: true })
    .click()
  await page.getByLabel('Arus I5 (A)', { exact: true }).fill('4,5')
  await page.getByLabel('Arah I5', { exact: true }).selectOption('masuk')
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Belum tepat')
  await page.getByLabel('Arah I5', { exact: true }).selectOption('keluar')
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await page
    .getByRole('button', { name: 'Continue to Next Mission', exact: true })
    .click()
  await page
    .getByLabel('Energi selama 30 hari (kWh)', { exact: true })
    .fill('153 kWh')
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await page
    .getByRole('button', { name: 'Complete Checkpoint', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Start PhET Challenge', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: /Challenge/ }).first(),
  ).toBeVisible()
})
