import { test, expect } from '@playwright/test'
import { learningAccess } from '../src/data/learningAccess'
import type { ProfileLearning } from '../src/hooks/useDynamicLearning'
const base: ProfileLearning = {
  materials: [1, 2, 3, 4, 5, 6],
  quizzes: Object.fromEntries(
    [1, 2, 3, 4, 5, 6].map((id) => [
      id,
      { answer: 'x', complete: true, attempts: 1 },
    ]),
  ),
  challenges: [1, 2, 3, 4, 5, 6],
  challengeDrafts: {},
  summative: { answers: {}, essays: [], submitted: false },
}
test('old challenges never auto-complete new worksheet and old summative remains reviewable', () => {
  expect(learningAccess(base).challengeReady(1)).toBeTruthy()
  expect(learningAccess(base).challengeReady(2)).toBeFalsy()
  expect(learningAccess(base).summativeReady).toBeFalsy()
  expect(
    learningAccess({
      ...base,
      summative: { ...base.summative, submitted: true },
    }).summativeReady,
  ).toBeTruthy()
  expect(learningAccess({ ...base, quizzes: {} }).challengeReady(1)).toBeFalsy()
})
test('failed storage never unlocks summative or claims saved draft', async ({
  page,
}) => {
  await page.addInitScript((value) => {
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
      JSON.stringify({ version: 1, profiles: { 'student:nara': value } }),
    )
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'voltquest.dynamic-electricity.v1')
        throw new DOMException('Full', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  }, base)
  await page.goto('/')
  await page.getByRole('button', { name: 'Start Challenge' }).click()
  await page.getByRole('button', { name: 'Simpan draf', exact: true }).click()
  await expect(
    page.getByText(
      'Draf gagal disimpan. Ruang penyimpanan mungkin penuh; jangan tutup halaman.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Selesaikan Challenge', exact: true }),
  ).toBeDisabled()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
          .profiles['student:nara'].worksheet,
    ),
  ).toBeUndefined()
})
