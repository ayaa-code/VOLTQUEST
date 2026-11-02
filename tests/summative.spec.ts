import { test, expect, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const key = 'voltquest.dynamic-electricity.v1'
test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
  await page.route('**/api/ai', (r) => r.fulfill({ json: { enabled: false } }))
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
async function open(page: Page) {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Sumatif Listrik Dinamis', exact: true })
    .click()
}
async function fill(page: Page, first = 'Tidak tahu', second = 'Belum paham') {
  for (const id of ['wire', 'loop', 'safety'])
    await page.locator(`[data-question="${id}"] input`).first().check()
  await page.locator('#essay-lamps').fill(first)
  await page.locator('#essay-batteries').fill(second)
}
const submit = (page: Page) =>
  page
    .getByRole('button', { name: 'Kirim asesmen sumatif', exact: true })
    .click()
const record = (page: Page) =>
  page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).profiles['demo:admin'].summative,
    key,
  )

test('empty, whitespace and incomplete legacy essays show specific errors without submission', async ({
  page,
}) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key))
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          profiles: {
            'demo:admin': {
              materials: [],
              challenges: [],
              challengeDrafts: {},
              quizzes: {},
              summative: { answers: {}, essays: [], submitted: false },
            },
          },
        }),
      )
  }, key)
  await open(page)
  await expect(page.locator('.summative-feedback')).toHaveCount(0)
  await submit(page)
  await expect(page.locator('#error-wire')).toBeVisible()
  await expect(page.locator('#error-lamps')).toBeVisible()
  await expect(
    page.locator('[data-question="wire"] input').first(),
  ).toBeFocused()
  await fill(page, '  ', 'Jawaban kedua')
  await submit(page)
  await expect(page.locator('#error-lamps')).toBeVisible()
  await expect(page.locator('#essay-lamps')).toBeFocused()
  expect((await record(page)).submitted).toBe(false)
})

test('short essays and wrong choices submit, produce both feedbacks, and preserve profile data', async ({
  page,
}, info) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key))
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          profiles: {
            other: {
              materials: [1],
              summative: {
                answers: {},
                essays: ['lama', 'lama'],
                submitted: false,
              },
            },
          },
        }),
      )
  }, key)
  await open(page)
  await fill(page)
  await submit(page)
  await expect(
    page.getByRole('region', { name: 'Hasil asesmen sumatif' }),
  ).toBeVisible()
  await expect(
    page.getByRole('article', { name: 'Feedback Penerangan kantor' }),
  ).toContainText('belum menjelaskan')
  await expect(
    page.getByRole('article', { name: 'Feedback Rancangan sumber kendaraan' }),
  ).toContainText('belum menjelaskan')
  const saved = await record(page)
  expect(saved.submitted).toBe(true)
  expect(saved.submission.review.correctCount).toBe(0)
  expect(saved.submission.review.essays).toHaveLength(2)
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).profiles.other.materials,
      key,
    ),
  ).toEqual([1])
  mkdirSync('tmp/summative-evidence', { recursive: true })
  await page.screenshot({
    path: `tmp/summative-evidence/results-${info.project.name}.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await open(page)
  await expect(page.locator('#essay-lamps')).toHaveValue('Tidak tahu')
  await expect(
    page.getByRole('region', { name: 'Hasil asesmen sumatif' }),
  ).toBeVisible()
})

test('autosave restores draft and revised submission keeps original snapshot and clears old feedback', async ({
  page,
}) => {
  await open(page)
  await fill(page)
  await open(page)
  await expect(page.locator('#essay-batteries')).toHaveValue('Belum paham')
  expect((await record(page)).submitted).toBe(false)
  await submit(page)
  await expect(page.locator('.summative-results')).toBeVisible()
  const first = (await record(page)).submission
  await page
    .locator('#essay-lamps')
    .fill(
      'Dengan asumsi hambatan tetap, paralel 120 W; seri 13,33 W. Saat putus, jalur seri terhenti dan cabang paralel lain tetap menyala.',
    )
  await expect(page.locator('.summative-results')).toHaveCount(0)
  await expect(
    page.getByText('Jawaban telah berubah.', { exact: false }),
  ).toBeVisible()
  await submit(page)
  await expect(page.locator('.summative-results')).toBeVisible()
  const saved = await record(page)
  expect(saved.history[0].id).toBe(first.id)
  expect(saved.history[0].input.essays.lamps).toBe('Tidak tahu')
  expect(saved.submission.review.essays[0].strengths.length).toBeGreaterThan(0)
  expect(saved.submission.ai).toBeUndefined()
})

test('unavailable assessment leaves saved draft, allows retry, and double click submits once', async ({
  page,
}) => {
  let requests = 0
  await page.route('**/api/assessment', (r) => {
    requests++
    return r.fulfill({ status: 503, json: {} })
  })
  await open(page)
  await fill(page)
  await submit(page)
  await expect(page.getByRole('alert')).toContainText('Draf tetap tersimpan')
  expect((await record(page)).submitted).toBe(false)
  await expect(page.locator('#essay-lamps')).toHaveValue('Tidak tahu')
  await page.unroute('**/api/assessment')
  let secondRequests = 0
  await page.route('**/api/assessment', async (r) => {
    secondRequests++
    const response = await r.fetch()
    await r.fulfill({ response })
  })
  await page
    .getByRole('button', { name: 'Kirim asesmen sumatif', exact: true })
    .evaluate((button: HTMLButtonElement) => {
      button.click()
      button.click()
    })
  await expect(page.locator('.summative-results')).toBeVisible()
  expect(requests).toBe(1)
  expect(secondRequests).toBe(1)
})

test('failed final storage never claims success and original draft survives', async ({
  page,
}) => {
  await open(page)
  await fill(page)
  await page.route('**/api/assessment', async (r) => {
    const response = await r.fetch()
    await page.evaluate((key) => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (k, v) {
        if (k === key) throw new Error('QuotaExceededError')
        original.call(this, k, v)
      }
    }, key)
    await r.fulfill({ response })
  })
  await submit(page)
  await expect(page.getByRole('alert')).toContainText('Hasil belum tersimpan')
  await expect(page.locator('.summative-results')).toHaveCount(0)
  expect((await record(page)).submitted).toBe(false)
  expect((await record(page)).essayAnswers.lamps).toBe('Tidak tahu')
})

test('AI failure or malformed output retains submission and local feedback', async ({
  page,
}) => {
  await page.unroute('**/api/ai')
  let mode = 'fail'
  await page.route('**/api/ai', (r) =>
    r.request().method() === 'GET'
      ? r.fulfill({ json: { enabled: true, siteKey: 'test' } })
      : mode === 'fail'
        ? r.fulfill({
            status: 503,
            json: {
              error: 'Layanan sedang tidak tersedia; jawaban tetap tersimpan.',
            },
          })
        : r.fulfill({ json: { result: { essays: [] } } }),
  )
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_el: HTMLElement, options: Record<string, unknown>) => {
        ;(options.callback as (token: string) => void)('test-proof')
        return 'widget'
      },
      remove: () => {},
      reset: () => {},
    }
  })
  await open(page)
  await fill(page)
  await submit(page)
  await page.getByRole('checkbox').check()
  await page
    .getByRole('button', { name: 'Tinjau uraian dengan AI', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText(
    'Layanan sedang tidak tersedia',
  )
  expect((await record(page)).submitted).toBe(true)
  await expect(page.locator('.summative-results')).toBeVisible()
  mode = 'invalid'
  await page.getByRole('checkbox').uncheck()
  await page.getByRole('checkbox').check()
  await page
    .getByRole('button', { name: 'Tinjau uraian dengan AI', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText('Respons AI tidak valid')
  expect((await record(page)).submission.ai).toBeUndefined()
})

test('diagram, fields and feedback fit all required widths without horizontal overflow', async ({
  page,
}, info) => {
  await open(page)
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(
      page.getByRole('img', {
        name: 'Diagram dua loop dengan R₃ pada cabang tengah',
      }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true)
    await page.locator('#essay-lamps').fill('Tidak tahu')
    await expect(page.locator('#essay-lamps')).toBeVisible()
    mkdirSync('tmp/summative-evidence', { recursive: true })
    await page.screenshot({
      path: `tmp/summative-evidence/form-${info.project.name}-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    })
  }
})

test('valid AI feedback persists with its submission and is not reused for a revised answer', async ({
  page,
}) => {
  await page.unroute('**/api/ai')
  const result = {
    essays: ['lamps', 'batteries'].map((id) => ({
      id,
      status: 'perlu-revisi',
      strengths: [],
      findings: [
        {
          explanation:
            'Penjelasan siswa belum menyebut hubungan sumber dan beban.',
          suggestion: 'Jelaskan sambungan dan alasannya berdasarkan kasus.',
        },
      ],
      topicIds: [4],
    })),
    limitations: 'Tinjauan AI atas tulisan; telaah guru tetap diperlukan.',
  }
  await page.route('**/api/ai', (r) =>
    r.fulfill({
      json:
        r.request().method() === 'GET'
          ? { enabled: true, siteKey: 'test' }
          : { result },
    }),
  )
  await page.addInitScript(() => {
    window.turnstile = {
      render: (_el: HTMLElement, options: Record<string, unknown>) => {
        ;(options.callback as (token: string) => void)('test-proof')
        return 'widget'
      },
      remove: () => {},
      reset: () => {},
    }
  })
  await open(page)
  await fill(page)
  await submit(page)
  await page.getByRole('checkbox').check()
  await page
    .getByRole('button', { name: 'Tinjau uraian dengan AI', exact: true })
    .click()
  await expect(page.locator('.summative-ai-review')).toHaveCount(2)
  expect((await record(page)).submission.ai.essays).toHaveLength(2)
  await open(page)
  await expect(page.locator('.summative-ai-review')).toHaveCount(2)
  await page
    .locator('#essay-lamps')
    .fill('Penjelasan baru tentang lampu paralel dan seri.')
  await expect(page.locator('.summative-ai-review')).toHaveCount(0)
  await submit(page)
  await expect(page.locator('.summative-results')).toBeVisible()
  expect((await record(page)).submission.ai).toBeUndefined()
  expect((await record(page)).history[0].ai.essays).toHaveLength(2)
})

test('leaving while a review is pending cannot mark an unsent draft complete', async ({
  page,
}) => {
  let release: () => void = () => {}
  let arrived: () => void = () => {}
  const requestArrived = new Promise<void>((resolve) => {
    arrived = resolve
  })
  await page.route('**/api/assessment', async (route) => {
    const response = await route.fetch()
    const hold = new Promise<void>((resolve) => {
      release = resolve
    })
    arrived()
    await hold
    await route.fulfill({ response }).catch(() => {})
  })
  await open(page)
  await fill(page)
  await submit(page)
  await requestArrived
  await page
    .getByRole('button', { name: 'Kembali ke progres', exact: true })
    .click()
  release()
  await expect(page.locator('.summative-detail')).toHaveCount(0)
  expect((await record(page)).submitted).toBe(false)
  expect((await record(page)).essayAnswers.batteries).toBe('Belum paham')
})
