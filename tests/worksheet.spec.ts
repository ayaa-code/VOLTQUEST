import { test, expect } from '@playwright/test'
import {
  emptyWorksheet,
  inspectWorksheet,
  numberOf,
  snapshotOf,
} from '../src/data/challengeWorksheet'

test('numbers distinguish empty, zero and invalid units; calculations follow inputs', () => {
  expect(numberOf('')).toBeNull()
  expect(numberOf('0')).toBe(0)
  expect(numberOf('0,25')).toBe(0.25)
  expect(numberOf('3 A')).toBeNull()
  expect(numberOf('Infinity')).toBeNull()
  const data = emptyWorksheet()
  data.fields = {
    b0v: '6',
    b0i: '0,5',
    d1: '1',
    d2: '2',
    dIn: '3',
    dV: '4',
    dI: '2',
  }
  expect(inspectWorksheet(data).computed).toMatchObject({
    b0r: 12,
    branch: 3,
    difference: 0,
    power: 8,
  })
  data.fields.b0i = '0'
  expect(inspectWorksheet(data).computed.b0r).toBeNull()
  expect(
    inspectWorksheet(data).findings.some(
      (f) => f.field === 'b0i' && f.kind === 'error',
    ),
  ).toBeTruthy()
})
test('blank worksheet template preserves legacy notes without granting completion', async ({
  page,
}) => {
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
  await page.route('**/api/ai', (r) => r.fulfill({ json: { enabled: false } }))
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
            materials: [1, 2, 3, 4, 5, 6],
            quizzes: Object.fromEntries(
              [1, 2, 3, 4, 5, 6].map((id) => [
                id,
                { complete: true, attempts: 1, answer: 'x' },
              ]),
            ),
            challenges: [1, 2, 3, 4, 5, 6],
            challengeDrafts: {
              1: {
                visited: true,
                observation: 'Arsip pengamatan',
                reflection: 'Arsip analisis',
              },
            },
            summative: { answers: {}, essays: ['', ''], submitted: false },
          },
          'student:bima': {
            materials: [],
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
  await expect(
    page.getByRole('progressbar', { name: 'Progres Listrik Dinamis' }),
  ).toHaveAttribute('aria-valuemax', '10')
  await page.getByRole('button', { name: 'Start Challenge' }).click()
  await expect(page.locator('.path-catalog')).toHaveCount(0)
  await expect(page.locator('.worksheet-template')).toHaveCount(5)
  await expect(
    page.locator('.worksheet-template :is(input,textarea,table,[role=table])'),
  ).toHaveCount(0)
  await page.getByText('Catatan Challenge sebelumnya', { exact: true }).click()
  await expect(
    page.getByText('Arsip pengamatan', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Simpan dan minta feedback' }),
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Selesaikan Challenge', exact: true }),
  ).toBeDisabled()
  await page.getByRole('button', { name: /Mulai simulasi/ }).click()
  await expect(page.locator('iframe')).toHaveCount(1)
  await page.getByRole('button', { name: 'Simpan draf', exact: true }).click()
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
  )
  expect(state.profiles['student:nara'].challengeDrafts[1].observation).toBe(
    'Arsip pengamatan',
  )
  expect(state.profiles['student:nara'].worksheet.completedAt).toBeUndefined()
  expect(state.profiles['student:bima'].worksheet).toBeUndefined()
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBeTruthy()
  }
  expect(snapshotOf(state.profiles['student:nara'].worksheet.data)).toBe(
    state.profiles['student:nara'].worksheet.snapshot,
  )
})
