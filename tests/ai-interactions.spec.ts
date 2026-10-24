import { test, expect } from '@playwright/test'
import { worksheetFields, snapshotOf } from '../src/data/challengeWorksheet'
test('review consent, duplicate prevention, stale responses, history and chat privacy', async ({
  page,
}) => {
  const data = {
    visited: true,
    fields: Object.fromEntries(
      worksheetFields.map((f) => [
        f.id,
        f.numeric ? '1' : 'Penjelasan siswa berdasar data.',
      ]),
    ),
  }
  await page.addInitScript(
    ({ data, snapshot }) => {
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
                  { complete: true, attempts: 1, answer: 'SECRET_ANSWER' },
                ]),
              ),
              challenges: [],
              challengeDrafts: {},
              summative: { answers: {}, essays: [], submitted: false },
              worksheet: {
                data,
                snapshot,
                savedAt: new Date().toISOString(),
                history: [],
                feedback: [],
              },
            },
          },
        }),
      )
      window.turnstile = {
        render: (_el, options) => {
          setTimeout(() => options.callback('test-token'), 0)
          return 'test-widget'
        },
        remove: () => {},
        reset: () => {},
      }
    },
    { data, snapshot: snapshotOf(data) },
  )
  let release: () => void = () => {},
    posts = 0
  const response = {
    summary: 'Analisis perlu ditinjau.',
    coverage: ['A', 'B', 'C', 'D', 'Kesimpulan'],
    strengths: ['Isian lengkap.'],
    findings: [],
    limitations: 'AI tidak melihat simulasi.',
  }
  await page.route('**/api/ai', async (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ json: { enabled: true, siteKey: 'test' } })
    posts++
    const body = route.request().postDataJSON()
    expect(JSON.stringify(body)).not.toContain('SECRET_ANSWER')
    expect(JSON.stringify(body)).not.toContain('student:nara')
    if (body.task === 'review') {
      await new Promise<void>((resolve) => {
        release = resolve
      })
      return route.fulfill({ json: { result: response } })
    }
    expect(body.data).toBeUndefined()
    return route.fulfill({
      json: {
        result: { answer: 'Mari tinjau jalur arus.', relatedTopicIds: [1] },
      },
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Start Challenge' }).click()
  await page.getByRole('button', { name: /^Challenge/ }).click()
  await page.getByRole('button', { name: 'Simpan dan minta feedback' }).click()
  expect(posts).toBe(0)
  await page
    .getByRole('checkbox', { name: /Saya setuju/ })
    .first()
    .check()
  await page.getByRole('button', { name: 'Simpan dan minta feedback' }).click()
  await expect.poll(() => posts).toBe(1)
  await expect(
    page.getByRole('button', { name: 'Simpan dan minta feedback' }),
  ).toBeDisabled()
  await page
    .locator('#conclusion')
    .fill('Kesimpulan direvisi saat AI memproses.')
  release()
  await expect(
    page.getByText(
      'Data berubah selama peninjauan. Simpan revisi dan minta feedback lagi.',
    ),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Simpan draf', exact: true }).click()
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
          .profiles['student:nara'].worksheet.feedback.length,
    ),
  ).toBe(0)
  await page.getByText('Tanya VoltQuest', { exact: true }).click()
  const panel = page.locator('.ai-panel')
  await panel.getByRole('checkbox', { name: /Saya setuju/ }).check()
  await panel.getByRole('textbox').fill('Mengapa arus sama pada seri?')
  await panel.getByRole('button', { name: 'Kirim pertanyaan' }).click()
  await expect(panel.getByText('Mari tinjau jalur arus.')).toBeVisible()
  await panel
    .getByRole('button', { name: 'Percakapan baru / hapus riwayat' })
    .click()
  await expect(panel.getByRole('log')).toBeEmpty()
})
