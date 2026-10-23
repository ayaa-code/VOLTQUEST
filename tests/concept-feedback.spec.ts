import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { missions } from '../src/data/missions'
import { confirmations, RULE_VERSION } from '../src/data/confirmations'
import {
  getConfirmation,
  getFeedbackOutcome,
  recommendationFor,
} from '../src/data/feedbackRules'
import type { FeedbackAttempt } from '../src/data/feedbackRules'
import { findPractice } from '../src/data/practice'

const key = 'voltquest.feedback.v1'
async function enter(page: Page, missionId = 3, completed: number[] = []) {
  await page.addInitScript(
    ({ completed }) => {
      if (sessionStorage.getItem('confirmation-seeded')) return
      sessionStorage.setItem('confirmation-seeded', 'yes')
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: 'student:nara',
          profiles: {
            'student:nara': { name: 'Nara', completed, visited: [] },
          },
        }),
      )
      const drafts: Record<string, unknown> = {}
      for (const id of [1, 2, 3, 4, 5])
        drafts[id] = {
          step: 3,
          prediction: 'Belum yakin',
          initialPrediction: { choice: 'Belum yakin', reason: '' },
          observations: {},
          observationStatus: 'skipped',
          answer: null,
          reflectionReason: 'Tulisan bebas tidak dinilai.',
        }
      localStorage.setItem(
        'voltquest.experiments.v1',
        JSON.stringify({ version: 1, profiles: { 'student:nara': drafts } }),
      )
    },
    { completed },
  )
  await page.goto(`/#misi-${missionId}`)
}
async function answer(page: Page, index: number) {
  await page.locator(`input[name="answer"][value="${index}"]`).check()
  await page
    .getByRole('button', { name: /^(Kirim jawaban|Coba jawaban lagi)$/ })
    .click()
}
async function confirm(page: Page, id: string) {
  await page.locator(`input[name="confirmation"][value="${id}"]`).check()
  await page.getByRole('button', { name: 'Lihat bantuan dari alasan' }).click()
}
async function stored(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
}

test('15 distractors, all confirmation responses, valid stable rules and mapping mismatch fallback', () => {
  let wrong = 0
  const ids = new Set<string>()
  for (const mission of missions) {
    const config = getConfirmation(mission)!
    expect(config).toBeTruthy()
    expect(config.options.some((option) => option.id === 'unsure')).toBe(true)
    expect(new Set(config.answers.map((answer) => answer.id)).size).toBe(4)
    expect(new Set(config.options.map((option) => option.id)).size).toBe(
      config.options.length,
    )
    for (const answer of config.answers) {
      if (answer.id !== config.correctAnswerId) {
        wrong++
        expect(
          config.options.some((option) => option.id === answer.indication),
        ).toBe(true)
      }
      const attempt: FeedbackAttempt = {
        id: 'test-attempt',
        revision: 'test-revision',
        missionId: mission.id,
        answerId: answer.id,
        confirmationId: config.id,
        draftResponseId: null,
        responseId: null,
        valid: true,
        ruleVersion: RULE_VERSION,
      }
      expect(getFeedbackOutcome(attempt)).toBeNull()
      for (const option of config.options) {
        const outcome = getFeedbackOutcome({
          ...attempt,
          draftResponseId: option.id,
          responseId: option.id,
        })!
        expect(outcome).toBeTruthy()
        expect(findPractice(outcome.response.exerciseId)).toBeTruthy()
        expect(outcome.reason).toContain(option.label)
        expect(outcome.kind).toBe(
          option.id === 'unsure'
            ? 'uncertain'
            : answer.indication === option.id
              ? 'supported'
              : answer.id === config.correctAnswerId &&
                  option.id === config.conceptResponseId
                ? 'consistent'
                : 'not-supported',
        )
        ids.add(outcome.ruleId)
        expect(
          recommendationFor('student:nara', {
            ...attempt,
            draftResponseId: option.id,
            responseId: option.id,
          })?.attemptId,
        ).toBe('test-attempt')
      }
      expect(
        getFeedbackOutcome({ ...attempt, responseId: 'missing' }),
      ).toBeNull()
      expect(
        getFeedbackOutcome({
          ...attempt,
          responseId: config.options[0].id,
          valid: false,
        }),
      ).toBeNull()
      expect(
        getFeedbackOutcome({
          ...attempt,
          responseId: config.options[0].id,
          ruleVersion: 99,
        }),
      ).toBeNull()
    }
    expect(
      getConfirmation({ ...mission, question: 'Pertanyaan telah berubah' }),
    ).toBeNull()
    expect(
      getConfirmation({ ...mission, options: [...mission.options].reverse() }),
    ).toBeNull()
    expect(
      getConfirmation({ ...mission, correct: (mission.correct + 1) % 4 }),
    ).toBeNull()
  }
  expect(wrong).toBe(15)
  expect(ids.size).toBe(
    confirmations.reduce((count, config) => count + config.options.length, 0),
  )
})

test('confirmation offers a traceable exercise, survives refresh and return, and preserves practice history', async ({
  page,
}) => {
  test.setTimeout(60000)
  await enter(page)
  const initialHistory = {
    activeId: 'energy-joules',
    records: {
      'ohm-find-resistance': {
        selectedId: '27-ohm',
        lastSubmittedId: '27-ohm',
        firstSubmittedId: '27-ohm',
        submitted: true,
        submissions: 2,
      },
    },
  }
  await page.evaluate(
    (value) =>
      localStorage.setItem(
        'voltquest.practice.v1',
        JSON.stringify({ version: 1, profiles: { 'student:nara': value } }),
      ),
    initialHistory,
  )
  await answer(page, 0)
  await expect(page.getByRole('status')).toContainText(missions[2].hint)
  await expect(
    page.getByRole('button', { name: 'Coba latihan yang ditawarkan' }),
  ).toHaveCount(0)
  await confirm(page, 'multiply')
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toContainText('Kamu memilih hubungan R = V × I')
  const before = (await stored(page)).profiles['student:nara']['3']
  await page.reload()
  expect((await stored(page)).profiles['student:nara']['3'].id).toBe(before.id)
  await expect(
    page.locator('input[name="confirmation"][value="multiply"]'),
  ).toBeChecked()
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Coba latihan yang ditawarkan' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Pilih resistor proyek' }),
  ).toBeVisible()
  await expect(page.locator('.practice-reason')).toContainText('R = V × I')
  let practice = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('voltquest.practice.v1')!).profiles[
        'student:nara'
      ],
  )
  expect(practice.records['ohm-find-resistance']).toEqual(
    initialHistory.records['ohm-find-resistance'],
  )
  expect(practice.source).toMatchObject({
    profileId: 'student:nara',
    missionId: 3,
    attemptId: before.id,
    responseId: 'multiply',
    exerciseId: 'ohm-find-resistance',
  })
  await page.reload()
  await expect(page.locator('.practice-reason')).toContainText('R = V × I')
  await expect(page.locator('.practice-attempts')).toContainText('2 pengiriman')
  await page
    .getByRole('button', { name: 'Kembali ke refleksi', exact: true })
    .first()
    .click()
  await expect(page.getByLabel('Berdasarkan pengamatanmu')).toHaveValue(
    'Tulisan bebas tidak dinilai.',
  )
  await confirm(page, 'divide')
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toContainText('tidak membuktikan kamu memakai perkalian')
  await page
    .getByRole('button', { name: 'Coba latihan yang ditawarkan' })
    .click()
  await expect(page.locator('.practice-reason')).toContainText('R = V ÷ I')
  await expect(page.locator('.practice-reason')).not.toContainText('R = V × I')
  await page.getByRole('button', { name: 'Ganti fokus latihan' }).click()
  await page
    .getByRole('button', {
      name: 'Latih Daya, durasi, dan energi',
      exact: true,
    })
    .click()
  await expect(page.locator('.practice-reason')).toHaveText(
    'Kamu memilih fokus Daya, durasi, dan energi.',
  )
  practice = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('voltquest.practice.v1')!).profiles[
        'student:nara'
      ],
  )
  expect(practice.source).toBeNull()
  await expect(page.locator('.header-xp')).toContainText('0 XP')
})

test('changing answers invalidates confirmation even when changed back; new submission creates fresh context', async ({
  page,
}) => {
  await enter(page)
  await answer(page, 0)
  await confirm(page, 'multiply')
  const first = (await stored(page)).profiles['student:nara']['3']
  await page.locator('input[name="answer"][value="1"]').check()
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Coba latihan yang ditawarkan' }),
  ).toHaveCount(0)
  await page.locator('input[name="answer"][value="0"]').check()
  await page.reload()
  await expect(page.locator('input[name="confirmation"]')).toHaveCount(0)
  await answer(page, 1)
  const second = (await stored(page)).profiles['student:nara']['3']
  expect(second.id).not.toBe(first.id)
  expect(second.responseId).toBeNull()
  await confirm(page, 'add')
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toContainText('Kamu memilih penjumlahan')
  await page.locator('input[name="confirmation"][value="unsure"]').check()
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Lihat bantuan dari alasan' }).click()
  await expect(
    page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
  ).toContainText('Belum yakin')
  await page
    .getByLabel('Berdasarkan pengamatanmu')
    .fill('perkalian penjumlahan kabel daya semua salah')
  await expect(
    page.locator('input[name="confirmation"][value="unsure"]'),
  ).toBeChecked()
})

test('confirmation is optional, all five correct answers still award XP once and no confirmation adds rewards', async ({
  page,
}) => {
  test.setTimeout(60000)
  await enter(page, 1)
  for (const mission of missions) {
    await answer(page, mission.correct)
    await expect(page.locator('.header-xp')).toContainText(
      `${mission.id * 100} XP`,
    )
    if (mission.id === 1) {
      await confirm(page, 'battery-source')
      await expect(
        page.getByRole('region', { name: 'Bantuan dari konfirmasi' }),
      ).toContainText('sejalan dengan jawaban refleksi')
      await expect(page.locator('.header-xp')).toContainText('100 XP')
    }
    await page
      .getByRole('button', {
        name:
          mission.id === 5
            ? 'Kembali ke dashboard'
            : 'Lanjut ke misi berikutnya',
        exact: true,
      })
      .click()
  }
  await expect(page.locator('.header-xp')).toContainText('500 XP')
  await expect(page.locator('.mission-card .is-complete')).toHaveCount(5)
  await page.getByRole('button', { name: 'Jelajahi misi lagi' }).click()
  await answer(page, 1)
  await expect(page.locator('.header-xp')).toContainText('500 XP')
})

test('stale recommendation is suppressed after another tab changes the confirmation; manual route remains', async ({
  page,
  context,
}) => {
  await enter(page)
  await answer(page, 0)
  await confirm(page, 'multiply')
  await page
    .getByRole('button', { name: 'Coba latihan yang ditawarkan' })
    .click()
  await expect(page.locator('.practice-reason')).toContainText('R = V × I')
  const other = await context.newPage()
  await other.goto('/#misi-3')
  await confirm(other, 'divide')
  await expect(page.locator('.practice-reason')).toHaveText(
    'Latihan umum; alasan rekomendasi sebelumnya tidak lagi digunakan.',
  )
  await page.reload()
  await expect(page.locator('.practice-reason')).not.toContainText('R = V × I')
  await page.getByRole('button', { name: 'Ganti fokus latihan' }).click()
  await page
    .getByRole('button', { name: 'Latih Hubungan V, I, dan R', exact: true })
    .click()
  await expect(page.locator('.practice-reason')).toHaveText(
    'Kamu memilih fokus Hubungan V, I, dan R.',
  )
  await other.close()
})

test('profiles isolate confirmation and recommendations', async ({ page }) => {
  await enter(page)
  await answer(page, 0)
  await confirm(page, 'multiply')
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Bima')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await page.locator('.mission-card').nth(2).click()
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await page.getByRole('button', { name: '4 Refleksi', exact: true }).click()
  await expect(page.locator('input[name="confirmation"]')).toHaveCount(0)
  await answer(page, 0)
  await confirm(page, 'unsure')
  const value = await stored(page)
  expect(value.profiles['student:nara']['3'].responseId).toBe('multiply')
  expect(value.profiles['student:bima']['3'].responseId).toBe('unsure')
})

test('corrupt, unknown-version and failed feedback writes leave legacy storage and manual practice usable', async ({
  page,
}) => {
  await enter(page)
  await page.evaluate((key) => localStorage.setItem(key, '{bad-json'), key)
  await page.reload()
  await expect(page.getByRole('alert')).toContainText(
    'Data konfirmasi tidak dapat dibaca',
  )
  await answer(page, 0)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({ version: 99, profiles: {}, future: 'keep' }),
      ),
    key,
  )
  await page.reload()
  await answer(page, 0)
  await confirm(page, 'multiply')
  expect((await stored(page)).future).toBe('keep')
  await expect(page.getByRole('alert')).toContainText(
    'Versi data konfirmasi belum didukung',
  )
  await expect(
    page.getByText('Konfirmasi tersimpan di browser ini.', { exact: true }),
  ).toHaveCount(0)
  await page.evaluate((key) => localStorage.removeItem(key), key)
  await page.reload()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'voltquest.feedback.v1')
        throw new DOMException('Quota', 'QuotaExceededError')
      return original.call(this, key, value)
    }
  })
  await answer(page, 0)
  await confirm(page, 'multiply')
  await expect(page.getByRole('alert')).toContainText(
    'Konfirmasi belum tersimpan',
  )
  await expect(
    page.getByText('Konfirmasi tersimpan di browser ini.', { exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Pilih latihan penguatan' }).click()
  await expect(
    page.getByRole('heading', { name: 'Pilih fokus latihanmu' }),
  ).toBeVisible()
  await expect(page.locator('.header-xp')).toContainText('0 XP')
})

test('five missions support keyboard confirmation and responsive feedback at five widths', async ({
  page,
}, info) => {
  test.setTimeout(120000)
  await enter(page, 1)
  for (const mission of missions) {
    if (mission.id > 1) {
      await page
        .getByRole('button', { name: 'Kembali ke misi', exact: true })
        .click()
      await page
        .locator('.mission-card')
        .nth(mission.id - 1)
        .click()
    }
    const wrong = mission.options.findIndex(
      (_, index) => index !== mission.correct,
    )
    await answer(page, wrong)
    const config = getConfirmation(mission)!
    await page.locator('input[name="confirmation"]').first().focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowDown')
    await expect(
      page.locator(
        `input[name="confirmation"][value="${config.options[1].id}"]`,
      ),
    ).toBeChecked()
    await page
      .getByRole('button', { name: 'Lihat bantuan dari alasan' })
      .click()
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${mission.id} at ${width}`,
      ).toBe(true)
      if (info.project.name === 'desktop' && [320, 1440].includes(width))
        await page.screenshot({
          path: `${process.env.VOLTQUEST_ARTIFACT_ROOT || 'artifacts/concept-feedback'}/m${mission.id}-confirmation-${width}.png`,
          fullPage: true,
          animations: 'disabled',
        })
    }
  }
})
