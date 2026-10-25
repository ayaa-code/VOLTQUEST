import { test, expect } from '@playwright/test'
import {
  blankLearning,
  LEARNING_KEY,
  readLearningStorage,
} from '../src/data/learningStorage'
import { explanationNeedsRevision } from '../src/data/reflectionReview'
import { inspectMission, type MissionInput } from '../src/data/missionReport'

test('damaged account progress is not replaced by an empty profile store', async ({
  page,
}) => {
  const raw = '{preserve-the-original'
  await page.addInitScript(
    (raw) => localStorage.setItem('voltquest.v1', raw),
    raw,
  )
  await page.goto('/')
  await page.getByLabel('Email atau username', { exact: true }).fill('admin')
  await page.getByLabel('Kata sandi', { exact: true }).fill('admin')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: /^Welcome, Young Scientist!/ }),
  ).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('voltquest.v1'))).toBe(
    raw,
  )
})

test('unknown and damaged learning storage is protected, older missing fields get defaults', () => {
  for (const raw of [
    '{bad',
    JSON.stringify({ version: 2, profiles: {} }),
    JSON.stringify({ version: 1, profiles: { a: { materials: 'all' } } }),
  ]) {
    expect(readLearningStorage({ getItem: () => raw }).blocked).toBe(true)
  }
  const result = readLearningStorage({
    getItem: () =>
      JSON.stringify({ version: 1, profiles: { a: { materials: [1] } } }),
  })
  expect(result.blocked).toBe(false)
  expect(result.store.profiles.a.materials).toEqual([1])
  expect(result.store.profiles.a.summative.submitted).toBe(false)
})

test('uncertainty is not mastery and equal voltages cannot demonstrate change', () => {
  for (const value of [
    'ga tau',
    'saya tidak tahu',
    'aku belum paham',
    'saya masih belum mengerti',
    '   ',
  ])
    expect(explanationNeedsRevision(value)).toBe(true)
  expect(
    explanationNeedsRevision(
      'Awalnya tidak tahu, tetapi lampu berubah saat jalurnya disambungkan.',
    ),
  ).toBe(false)
  const input: MissionInput = {
    prediction: 'Arus bertambah',
    predictionText: '',
    predictionReason: 'Saya ingin membandingkan',
    initialPrediction: null,
    observations: { r: '10', vA: '5', iA: '0.5', vB: '5', iB: '0.5' },
    comparison: 'Keduanya sama',
    answer: 3,
    reflectionReason:
      'Pada kedua kondisi saya mencatat tegangan dan arus yang sama.',
  }
  expect(
    inspectMission(3, input).some(
      (f) => f.kind === 'periksa' && f.text.includes('Tegangan pada kondisi'),
    ),
  ).toBe(true)
  input.observations.vB = '10'
  input.observations.iB = '1'
  expect(
    inspectMission(3, input).filter((f) => f.kind === 'periksa'),
  ).toHaveLength(0)
})

test('an unreadable learning record survives a real material completion attempt', async ({
  page,
}) => {
  const raw = JSON.stringify({
    version: 99,
    profiles: { 'demo:admin': { materials: [6] } },
    future: 'preserve',
  })
  await page.addInitScript(
    ({ raw, key }) => {
      if (!localStorage.getItem('voltquest.v1')) {
        localStorage.setItem(
          'voltquest.v1',
          JSON.stringify({
            active: 'demo:admin',
            profiles: {
              'demo:admin': { name: 'Admin', completed: [], visited: [] },
            },
          }),
        )
        localStorage.setItem(key, raw)
      }
    },
    { raw, key: LEARNING_KEY },
  )
  await page.goto('/')
  await page.getByRole('button', { name: /Explore Lessons/ }).click()
  await page.getByRole('button', { name: /Arus Listrik/ }).click()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LEARNING_KEY),
  ).toBe(raw)
  await page.reload()
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LEARNING_KEY),
  ).toBe(raw)
})

test('saving a lesson keeps progress written by another tab', async ({
  page,
  context,
}) => {
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
  await page.goto('/')
  await page.getByRole('button', { name: /Explore Lessons/ }).click()
  await page.getByRole('button', { name: /Arus Listrik/ }).click()
  const other = await context.newPage()
  await other.goto('/')
  const peer = { ...blankLearning(), materials: [1, 2] }
  await other.evaluate(
    ({ key, peer }) =>
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, profiles: { 'student:peer': peer } }),
      ),
    { key: LEARNING_KEY, peer },
  )
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    LEARNING_KEY,
  )
  expect(saved.profiles['student:peer']).toEqual(peer)
  expect(saved.profiles['demo:admin'].materials).toContain(1)
  await other.close()
})
