import { fillObservations } from './helpers/observations'
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const key = 'voltquest.experiments.v1'
async function enter(page: Page, id = 3) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Masuk atau Daftar' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await page
    .locator('.mission-card')
    .nth(id - 1)
    .click()
}
async function predict(page: Page) {
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await page
    .getByLabel('Mengapa kamu memperkirakan begitu?')
    .fill('Perlu membandingkan dua kondisi.')
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
}
async function logout(page: Page) {
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
}

test('draft survives reload, dashboard, edits, keyboard navigation and separate profiles', async ({
  page,
}) => {
  test.setTimeout(60000)
  await enter(page)
  await predict(page)
  await expect(page.locator('#step-heading')).toBeFocused()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#step-heading')).toBeFocused()
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Hambatan resistor (Ω)')).toBeFocused()
  await page.getByLabel('Hambatan resistor (Ω)').fill('6')
  await page.getByLabel('Tegangan A (V)').fill('6,0')
  await page.getByLabel('Arus A (A)').fill('0')
  await page.getByLabel('Tegangan B (V)').fill('12')
  await page.getByLabel('Arus B (A)').fill('1,8')
  await page
    .getByLabel('Apa yang berbeda dari prediksimu?')
    .fill('Arus yang dicatat berbeda.')
  await page.reload()
  await expect(page.getByLabel('Arus A (A)')).toHaveValue('0')
  await expect(page.getByLabel('Tegangan A (V)')).toHaveValue('6,0')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText(
    'Catatan pengamatan siswa',
  )
  await page
    .getByLabel('Berdasarkan pengamatanmu')
    .fill('Saya membandingkan kedua arus pada R tetap.')
  await page.getByRole('button', { name: '1 Prediksi', exact: true }).click()
  await page.getByRole('radio', { name: 'Arus bertambah', exact: true }).check()
  await page
    .getByLabel('Mengapa kamu memperkirakan begitu?')
    .fill('Prediksi setelah mencoba.')
  await page.getByRole('button', { name: '4 Refleksi', exact: true }).click()
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText(
    'Belum yakin',
  )
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText(
    'Prediksi yang diperbarui',
  )
  await page
    .getByRole('button', { name: 'Kembali ke misi', exact: true })
    .click()
  await page.locator('.mission-card').nth(2).click()
  await expect(page.getByLabel('Berdasarkan pengamatanmu')).toHaveValue(
    'Saya membandingkan kedua arus pada R tetap.',
  )
  await logout(page)
  await page.getByLabel('Siapa nama panggilanmu?').fill('Bima')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await page.locator('.mission-card').nth(2).click()
  await expect(
    page.getByRole('radio', { name: 'Belum yakin', exact: true }),
  ).not.toBeChecked()
  await expect(
    page.getByLabel('Mengapa kamu memperkirakan begitu?'),
  ).toHaveValue('')
  await logout(page)
  await page.getByLabel('Siapa nama panggilanmu?').fill('NARA')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await page.locator('.mission-card').nth(2).click()
  await expect(page.getByLabel('Berdasarkan pengamatanmu')).toHaveValue(
    'Saya membandingkan kedua arus pada R tetap.',
  )
})

test('legacy progress and corrupt drafts recover; incomplete data cannot unlock reflection', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [1, 2], visited: [1] },
        },
      }),
    )
    localStorage.setItem('voltquest.experiments.v1', '{bad-json')
  })
  await page.goto('/#misi-3')
  await expect(page.locator('.header-xp')).toContainText('200')
  await expect(page.getByRole('alert')).toContainText('Draf tidak dapat dibaca')
  await predict(page)
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: '4 Refleksi', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Hambatan resistor (Ω)')).toBeFocused()
  const stored = await page.evaluate(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey)!),
    key,
  )
  expect(
    Object.values(stored.profiles['student:nara']['3'].observations).every(
      (value) => value === '',
    ),
  ).toBe(true)
  expect(stored.profiles['student:nara']['3'].observationStatus).toBe('draft')
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('voltquest.v1')!),
  )
  expect(progress.profiles['student:nara'].completed).toEqual([1, 2])
  expect(progress.profiles['student:nara'].visited).toEqual([1])
})

test('unknown draft versions are retained and failed writes never say saved', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('draft-seeded')) {
      localStorage.setItem(
        'voltquest.experiments.v1',
        JSON.stringify({ version: 99, profiles: {}, future: 'retain me' }),
      )
      sessionStorage.setItem('draft-seeded', 'yes')
    }
  })
  await enter(page, 1)
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await expect(page.locator('.draft-status')).not.toContainText(
    'Draf tersimpan',
  )
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).future,
      key,
    ),
  ).toBe('retain me')
  await page.evaluate((k) => localStorage.removeItem(k), key)
  await page.reload()
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    }
  })
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await expect(page.getByRole('alert')).toContainText('Draf belum tersimpan')
  await expect(page.locator('.draft-status')).not.toContainText(
    'Draf tersimpan',
  )
})

test('power calculations distinguish blank and zero, reject invalid format and retain manual values', async ({
  page,
}) => {
  await enter(page, 4)
  await predict(page)
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await expect(page.getByLabel('Perhitungan dari catatan')).toContainText(
    'Belum dapat dihitung',
  )
  await page.getByLabel('Tegangan A (V)').fill('12')
  await page.getByLabel('Arus A (A)').fill('0,5')
  await page.getByLabel('Tegangan B (V)').fill('12')
  await page.getByLabel('Arus B (A)').fill('0')
  await page.getByLabel('Durasi (detik)').fill('60 s')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Durasi (detik)')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await page.getByLabel('Durasi (detik)').fill('60')
  await expect(page.getByLabel('Perhitungan dari catatan')).toContainText(
    'P = 6 W; E = 360 J',
  )
  await expect(page.getByLabel('Perhitungan dari catatan')).toContainText(
    'P = 0 W; E = 0 J',
  )
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText(
    'Catatan pengamatan siswa',
  )
  await expect(page.locator('.header-xp')).toContainText('0')
})

test('all missions and steps fit five viewport widths', async ({
  page,
}, testInfo) => {
  test.setTimeout(120000)
  await enter(page, 1)
  for (let id = 1; id <= 5; id++) {
    if (id > 1) {
      await page
        .getByRole('button', { name: 'Kembali ke misi', exact: true })
        .click()
      await page
        .locator('.mission-card')
        .nth(id - 1)
        .click()
    }
    for (let step = 0; step < 4; step++) {
      if (step === 1) await predict(page)
      if (step === 2)
        await page
          .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
          .click()
      if (step === 3) await fillObservations(page)
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `mission ${id}, step ${step}, width ${width}`,
        ).toBe(true)
        if (
          testInfo.project.name === 'desktop' &&
          (id === 1 || step === 2) &&
          (width === 320 || width === 1440)
        ) {
          await page.screenshot({
            path: `${process.env.VOLTQUEST_ARTIFACT_ROOT || 'artifacts/concept-feedback'}/regression-guided/m${id}-step${step + 1}-${width}.png`,
            fullPage: true,
            animations: 'disabled',
          })
        }
      }
    }
  }
})
