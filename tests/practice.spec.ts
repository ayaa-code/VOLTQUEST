import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { practiceConcepts, practiceExercises } from '../src/data/practice'
import { getPracticePlan } from '../src/data/practiceSelection'

const key = 'voltquest.practice.v1'
async function login(page: Page, name = 'Nara') {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Buka profil lama tanpa email' })
    .click()
  await page.getByLabel('Siapa nama panggilanmu?').fill(name)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
}
async function enter(page: Page) {
  await login(page)
  await page.getByRole('button', { name: 'Buka latihan mandiri' }).click()
}
async function selectFocus(page: Page, index: number) {
  await page
    .getByRole('button', {
      name: `Latih ${practiceConcepts[index].title}`,
      exact: true,
    })
    .click()
}
async function logout(page: Page, next: string) {
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill(next)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
}
async function readPractice(page: Page) {
  return page.evaluate(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey)!),
    key,
  )
}

test('bank has stable unique IDs, two exercises per concept, valid keys and explicit manual fallback', () => {
  expect(practiceExercises.length).toBeGreaterThanOrEqual(10)
  expect(new Set(practiceExercises.map((exercise) => exercise.id)).size).toBe(
    practiceExercises.length,
  )
  for (const concept of practiceConcepts) {
    const plan = getPracticePlan(concept.id)
    expect(plan.source).toBe('student-choice')
    expect(plan.reason).toBe(`Kamu memilih fokus ${concept.title}.`)
    expect(plan.exercises).toHaveLength(2)
    for (const exercise of plan.exercises) {
      expect(exercise.conceptId).toBe(concept.id)
      expect(
        exercise.options.filter((option) => option.id === exercise.correctId),
      ).toHaveLength(1)
      expect(new Set(exercise.options.map((option) => option.id)).size).toBe(
        exercise.options.length,
      )
      expect(new Set(exercise.options.map((option) => option.text)).size).toBe(
        exercise.options.length,
      )
      for (const text of [
        exercise.question,
        exercise.hint,
        exercise.explanation,
        exercise.assumption,
      ])
        expect(text.length).toBeGreaterThan(15)
    }
  }
  const correctText = (id: string) => {
    const exercise = practiceExercises.find((item) => item.id === id)!
    return exercise.options.find((option) => option.id === exercise.correctId)!
      .text
  }
  expect(correctText('ohm-find-resistance')).toBe(`${9 / 3} Ω`)
  expect(correctText('ohm-fixed-resistor')).toBe(
    `${(12 / 8).toLocaleString('id-ID')} A`,
  )
  expect(correctText('energy-joules')).toBe(`${12 * 0.5 * 60} J`)
  expect(correctText('energy-duration')).toContain(`${20 * 0.5} Wh`)
  expect(correctText('energy-duration')).toContain(`${10 * 2} Wh`)
})

test('manual practice restores drafts, feedback and counts; repeats never increase unique count or XP', async ({
  page,
}) => {
  test.setTimeout(60000)
  await enter(page)
  await selectFocus(page, 2)
  await expect(page.locator('#practice-exercise-title')).toBeFocused()
  await expect(
    page.getByRole('button', { name: 'Kirim jawaban latihan' }),
  ).toBeDisabled()
  await expect(page.getByRole('status')).toHaveCount(0)
  await page.getByRole('radio', { name: 'A 27 Ω', exact: true }).focus()
  await page.keyboard.press('Space')
  await page.reload()
  await expect(
    page.getByRole('radio', { name: 'A 27 Ω', exact: true }),
  ).toBeChecked()
  await expect(page.getByLabel('Ringkasan latihan')).toContainText('0 dari 10')
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  await expect(page.getByRole('status')).toContainText('Coba periksa kembali')
  await expect(page.getByRole('status')).not.toContainText('9 V ÷ 3 A = 3 Ω')
  await expect(
    page.getByRole('button', { name: 'Kirim jawaban latihan' }),
  ).toBeDisabled()
  await page.reload()
  await expect(page.getByRole('status')).toContainText('Coba periksa kembali')
  await expect(page.locator('.practice-attempts')).toContainText('1 pengiriman')
  await page.getByRole('radio', { name: 'D 3 Ω', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  await expect(page.getByRole('status')).toContainText(
    'R = V/I = 9 V ÷ 3 A = 3 Ω',
  )
  await expect(page.getByLabel('Ringkasan latihan')).toContainText(
    '1 dari 10 latihan pernah dikirim · 1 jawaban terakhir sesuai kunci',
  )
  await expect(page.locator('.practice-attempts')).toContainText('2 pengiriman')
  await expect(page.locator('.practice-attempts')).toContainText(
    'Jawaban pertama belum sesuai kunci',
  )
  await page.getByRole('button', { name: 'Ulangi latihan ini' }).click()
  await page.getByRole('radio', { name: 'D 3 Ω', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  await expect(page.locator('.practice-attempts')).toContainText('3 pengiriman')
  await expect(page.getByLabel('Ringkasan latihan')).toContainText('1 dari 10')
  await page.getByRole('button', { name: 'Ke dashboard misi' }).click()
  await page.getByRole('button', { name: 'Buka latihan mandiri' }).click()
  await expect(page.getByRole('status')).toContainText('Jawabanmu sesuai kunci')
  await expect(page.locator('.practice-attempts')).toContainText('3 pengiriman')
  await page.getByRole('button', { name: 'Coba latihan lain' }).click()
  await expect(
    page.getByRole('heading', { name: 'Tegangan berubah, resistor tetap' }),
  ).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.locator('.header-xp')).toContainText('0 XP')
  const stored = await readPractice(page)
  expect(
    stored.profiles['student:nara'].records['ohm-find-resistance'].submissions,
  ).toBe(3)
})

test('different profiles have separate history and manual choices ignore mission answers', async ({
  page,
}) => {
  await enter(page)
  await selectFocus(page, 0)
  await page.getByRole('radio', { name: /^A Baterai menyediakan/ }).check()
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  await logout(page, 'Bima')
  await page.getByRole('button', { name: 'Buka latihan mandiri' }).click()
  await expect(page.getByLabel('Ringkasan latihan')).toContainText('0 dari 10')
  await expect(
    page.getByRole('heading', { name: 'Pilih fokus latihanmu' }),
  ).toBeVisible()
  await selectFocus(page, 3)
  await expect(page.locator('.practice-reason')).toHaveText(
    'Kamu memilih fokus Daya, durasi, dan energi.',
  )
  await logout(page, 'NARA')
  await page.getByRole('button', { name: 'Buka latihan mandiri' }).click()
  await expect(
    page.getByRole('heading', { name: 'Bantu tim pojok baca' }),
  ).toBeVisible()
  await expect(page.getByLabel('Ringkasan latihan')).toContainText('1 dari 10')
})

test('reflection entry and return preserve legacy XP, badges and experiment drafts without gating missions', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': {
            name: 'Nara',
            completed: [1, 2, 3, 4, 5],
            visited: [3],
          },
        },
      }),
    )
    localStorage.setItem(
      'voltquest.experiments.v1',
      JSON.stringify({
        version: 1,
        profiles: {
          'student:nara': {
            '3': {
              step: 3,
              prediction: 'Belum yakin',
              predictionReason: 'Bukan data konfirmasi',
              initialPrediction: {
                choice: 'Belum yakin',
                reason: 'Bukan data konfirmasi',
              },
              observations: { r: '6', vA: '6', iA: '1', vB: '12', iB: '2' },
              comparison: '',
              observationStatus: 'recorded',
              reflectionReason: 'Tulisan bukan diagnosis',
              answer: 0,
            },
          },
        },
      }),
    )
  })
  await page.goto('/#misi-3')
  const before = await page.evaluate(() => [
    localStorage.getItem('voltquest.v1'),
    localStorage.getItem('voltquest.experiments.v1'),
  ])
  await page.getByRole('button', { name: 'Pilih latihan penguatan' }).click()
  await expect(
    page.getByRole('heading', { name: 'Pilih fokus latihanmu' }),
  ).toBeVisible()
  await selectFocus(page, 3)
  await expect(page.locator('.practice-reason')).not.toContainText('Hukum Ohm')
  await page.getByRole('radio', { name: 'C 360 J', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  await expect(page.locator('.header-xp')).toContainText('500 XP')
  expect(
    await page.evaluate(() => [
      localStorage.getItem('voltquest.v1'),
      localStorage.getItem('voltquest.experiments.v1'),
    ]),
  ).toEqual(before)
  await page
    .getByRole('button', { name: 'Kembali ke refleksi', exact: true })
    .first()
    .click()
  await expect(page.getByLabel('Berdasarkan pengamatanmu')).toHaveValue(
    'Tulisan bukan diagnosis',
  )
  await page.getByRole('button', { name: 'Pilih latihan penguatan' }).click()
  await page
    .getByRole('button', { name: 'Lanjut ke misi berikutnya', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Daya Listrik', exact: true }),
  ).toBeVisible()
})

test('corrupt practice JSON recovers without touching other storage', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('voltquest.practice.v1', '{bad-json'),
  )
  await enter(page)
  await expect(page.getByRole('alert')).toContainText(
    'Data latihan tidak dapat dibaca',
  )
  await selectFocus(page, 0)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.draft-status')).toContainText('Latihan tersimpan')
  expect((await readPractice(page)).version).toBe(1)
  await expect(page.locator('.header-xp')).toContainText('0 XP')
})

test('unknown versions are preserved and failed writes never claim saved', async ({
  page,
}) => {
  await enter(page)
  await page.evaluate(
    (storageKey) =>
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 99, future: 'keep', profiles: {} }),
      ),
    key,
  )
  await page.reload()
  await expect(page.getByRole('alert')).toContainText(
    'Versi data latihan belum didukung',
  )
  await selectFocus(page, 0)
  await expect(page.locator('.draft-status')).not.toContainText(
    'Latihan tersimpan',
  )
  expect((await readPractice(page)).future).toBe('keep')
  await page.evaluate((storageKey) => localStorage.removeItem(storageKey), key)
  await page.reload()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === 'voltquest.practice.v1')
        throw new DOMException('Quota', 'QuotaExceededError')
      return original.call(this, storageKey, value)
    }
  })
  await selectFocus(page, 0)
  await page.getByRole('radio', { name: /^A Baterai menyediakan/ }).check()
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  await expect(page.getByRole('alert')).toContainText('Latihan belum tersimpan')
  await expect(page.locator('.draft-status')).not.toContainText(
    'Latihan tersimpan',
  )
  await expect(page.getByRole('status')).toContainText('Jawabanmu sesuai kunci')
})

test('invalid record fields and unknown exercises cannot invent attempts or correct feedback', async ({
  page,
}) => {
  await enter(page)
  await page.evaluate(
    (storageKey) =>
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          version: 1,
          profiles: {
            'student:nara': {
              activeId: 'ohm-find-resistance',
              records: {
                'not-a-real-exercise': { submissions: 999 },
                'ohm-find-resistance': {
                  selectedId: 'wrong-id',
                  lastSubmittedId: 'wrong-id',
                  firstSubmittedId: 'wrong-id',
                  submissions: -99,
                  submitted: true,
                },
              },
            },
          },
        }),
      ),
    key,
  )
  await page.reload()
  await expect(page.getByLabel('Ringkasan latihan')).toContainText('0 dari 10')
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Kirim jawaban latihan' }),
  ).toBeDisabled()
  await page.getByRole('radio', { name: 'D 3 Ω', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
  expect(
    (await readPractice(page)).profiles['student:nara'].records[
      'not-a-real-exercise'
    ],
  ).toBeUndefined()
})

test('all ten exercises work; focus, feedback and exit controls fit five widths', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await enter(page)
  async function layout(state: string) {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${state} at ${width}`,
      ).toBe(true)
      const small = await page
        .locator('main button, main label.answer-option')
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect()
              return box.width > 0 && (box.width < 43.9 || box.height < 43.9)
            })
            .map((element) => element.textContent),
        )
      expect(small, `${state} target sizes at ${width}`).toEqual([])
      if (testInfo.project.name === 'desktop' && [320, 1440].includes(width))
        await page.screenshot({
          path: `${process.env.VOLTQUEST_ARTIFACT_ROOT || 'artifacts/concept-feedback'}/regression-practice/${state}-${width}.png`,
          fullPage: true,
          animations: 'disabled',
        })
    }
  }
  await layout('focus')
  for (let i = 0; i < practiceConcepts.length; i++) {
    await selectFocus(page, i)
    const plan = getPracticePlan(practiceConcepts[i].id)
    for (let j = 0; j < plan.exercises.length; j++) {
      const exercise = plan.exercises[j]
      if (i === 2 && j === 0) await layout('question')
      await page.locator(`input[value="${exercise.correctId}"]`).check()
      await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
      await expect(page.getByRole('status')).toContainText(exercise.explanation)
      if (i === 2 && j === 0) await layout('correct-feedback')
      if (j === 0)
        await page.getByRole('button', { name: 'Coba latihan lain' }).click()
    }
    await page.getByRole('button', { name: 'Ganti fokus latihan' }).click()
    await expect(
      page.getByRole('heading', { name: 'Pilih fokus latihanmu' }),
    ).toBeFocused()
  }
  await expect(page.getByLabel('Ringkasan latihan')).toContainText(
    '10 dari 10 latihan pernah dikirim · 10 jawaban terakhir sesuai kunci',
  )
  await expect(page.locator('.header-xp')).toContainText('0 XP')
  expect(errors).toEqual([])
})
