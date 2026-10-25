import { test, expect, type Page } from '@playwright/test'
import { fillObservations } from './helpers/observations'
import { experimentScreens } from '../src/data/experiments'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
  await page.route('https://phet.colorado.edu/**', (r) =>
    r.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>PhET test frame</title><p>Simulation probe</p>',
    }),
  )
  await page.addInitScript(() => {
    if (!localStorage.getItem('voltquest.dynamic-electricity.v1'))
      localStorage.setItem(
        'voltquest.dynamic-electricity.v1',
        JSON.stringify({
          version: 1,
          profiles: {
            'demo:admin': {
              materials: [],
              quizzes: {},
              challenges: [],
              challengeDrafts: {},
              summative: { answers: {}, essays: ['', ''], submitted: false },
            },
          },
        }),
      )
    if (!localStorage.getItem('voltquest.v1'))
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: 'demo:admin',
          profiles: {
            'demo:admin': { name: 'Admin', completed: [], visited: [] },
            'student:nara': { name: 'Nara', completed: [], visited: [] },
          },
        }),
      )
  })
})
async function openMission(page: Page) {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Komponen Rangkaian', exact: true })
    .click()
}
async function predict(page: Page) {
  await page.getByRole('radio', { name: 'Prediksi lain', exact: true }).check()
  await page
    .locator('#prediction-text')
    .fill('Saya menduga keadaan lampu berubah saat sakelar ditutup.')
  await page
    .locator('#prediction-reason')
    .fill('Saya akan membandingkan kedua keadaan dengan pengamatan sendiri.')
}

test('immediate refresh restores draft and resume does not grade or change progress', async ({
  page,
}) => {
  let submits = 0
  await page.route('**/api/assessment', (r) => {
    submits++
    return r.abort()
  })
  await openMission(page)
  await predict(page)
  await page.locator('#prediction-text').fill('Karakter terakhir: Z')
  await page.reload()
  await expect(page.locator('.hero-copy')).toBeVisible()
  await page
    .getByRole('button', { name: 'Lanjutkan kegiatan terakhir', exact: true })
    .click()
  await expect(page.locator('#prediction-text')).toHaveValue(
    'Karakter terakhir: Z',
  )
  await expect(page.locator('.draft-status')).toContainText(
    'Tersimpan di perangkat ini',
  )
  expect(submits).toBe(0)
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.v1')!).profiles['demo:admin']
          .completed,
    ),
  ).toEqual([])
})

test('guide precedes one stable iframe through steps, offline edits and explicit retry', async ({
  page,
  context,
}, info) => {
  let requests = 0
  await page.route('https://phet.colorado.edu/**', (r) => {
    requests++
    return r.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><p>Simulation probe</p>',
    })
  })
  await openMission(page)
  await predict(page)
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Siapkan Eksperimenmu' }),
  ).toBeVisible()
  await expect(
    page.getByText('Mulai di PhET: pilih Intro.', { exact: false }),
  ).toBeVisible()
  await expect(
    page.getByText('Simulasi di halaman ini', { exact: true }),
  ).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Mulai simulasi di sini', exact: true })
    .click()
  await expect(page.locator('iframe')).toHaveCount(1)
  await expect(
    page.frameLocator('iframe').getByText('Simulation probe'),
  ).toBeVisible()
  await page.evaluate(() => {
    ;(window as unknown as { keptFrame: Element | null }).keptFrame =
      document.querySelector('iframe')
  })
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 })
    const guide = await page.locator('.lab-card').boundingBox(),
      lab = await page.locator('.phet-lab').boundingBox()
    expect(guide!.y + guide!.height).toBeLessThanOrEqual(lab!.y)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `tmp/experiment-${info.project.name}-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      })
  }
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await fillObservations(page)
  await page
    .locator('#reflection-reason')
    .fill('Je relie les observations aux changements du circuit.')
  await page
    .getByRole('button', { name: 'Kembali ke pengamatan', exact: true })
    .click()
  await context.setOffline(true)
  await page
    .locator('#comparison')
    .fill('Catatan tetap tersimpan ketika koneksi putus.')
  await expect(page.locator('.draft-status')).toContainText(
    'Tersimpan di perangkat ini',
  )
  await page
    .getByRole('button', { name: 'Kembali ke eksperimen', exact: true })
    .click()
  await context.setOffline(false)
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { keptFrame: Element | null }).keptFrame ===
        document.querySelector('iframe'),
    ),
  ).toBe(true)
  expect(requests).toBe(1)
  await page
    .getByRole('button', { name: 'Coba muat simulasi', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText('mengulang susunan')
  await page.getByRole('button', { name: 'Batal', exact: true }).click()
  expect(requests).toBe(1)
  await page
    .getByRole('button', { name: 'Coba muat simulasi', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Muat ulang simulasi', exact: true })
    .click()
  await expect.poll(() => requests).toBe(2)
  await page.reload()
  await page
    .getByRole('button', { name: 'Lanjutkan kegiatan terakhir', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await expect(page.locator('#comparison')).toHaveValue(
    'Catatan tetap tersimpan ketika koneksi putus.',
  )
  expect(experimentScreens[3].tab).toBe('Lab')
})

test('screenshot evidence survives reload, rejects invalid files and stays profile-specific', async ({
  page,
}) => {
  await openMission(page)
  await predict(page)
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  const file = page.locator('.evidence-upload input')
  await expect(file).toBeEnabled()
  await file.setInputFiles({
    name: 'bad.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  })
  await expect(
    page.getByRole('region', { name: 'Bukti rangkaian' }),
  ).toContainText('Pilih gambar PNG')
  const buffer = await page.screenshot()
  await file.setInputFiles({
    name: 'circuit.png',
    mimeType: 'image/png',
    buffer,
  })
  await expect(
    page.getByText('Bukti tersimpan di perangkat ini.', { exact: true }),
  ).toBeVisible()
  await page.reload()
  await page
    .getByRole('button', { name: 'Lanjutkan kegiatan terakhir', exact: true })
    .click()
  await expect(page.locator('.evidence-preview')).toBeVisible()
  await expect(
    page.getByText('Bukti tersimpan di perangkat ini.', { exact: true }),
  ).toBeVisible()
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('voltquest.v1')!)
    p.active = 'student:nara'
    localStorage.setItem('voltquest.v1', JSON.stringify(p))
    const k = 'voltquest.dynamic-electricity.v1',
      d = JSON.parse(localStorage.getItem(k)!)
    d.profiles['student:nara'] = {
      materials: [1, 2, 3],
      quizzes: {},
      challenges: [],
      challengeDrafts: {},
      summative: { answers: {}, essays: ['', ''], submitted: false },
    }
    localStorage.setItem(k, JSON.stringify(d))
  })
  await openMission(page)
  await predict(page)
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await expect(page.locator('.evidence-upload input')).toBeEnabled()
  await expect(page.locator('.evidence-preview')).toHaveCount(0)
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem('voltquest.v1')!)
    p.active = 'demo:admin'
    localStorage.setItem('voltquest.v1', JSON.stringify(p))
  })
  await page.reload()
  await page
    .getByRole('button', { name: 'Lanjutkan kegiatan terakhir', exact: true })
    .click()
  await expect(page.locator('.evidence-preview')).toBeVisible()
  await page
    .getByRole('button', { name: 'Hapus screenshot', exact: true })
    .click()
  await expect(page.locator('.evidence-preview')).toHaveCount(0)
})

test('quota failure keeps current input and retry persists it; failed grading adds no attempt', async ({
  page,
}) => {
  await openMission(page)
  await predict(page)
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    ;(window as unknown as { restoreStorage: () => void }).restoreStorage =
      () => {
        Storage.prototype.setItem = original
      }
    Storage.prototype.setItem = function (k, v) {
      if (k === 'voltquest.experiments.v1')
        throw new DOMException('Full', 'QuotaExceededError')
      return original.call(this, k, v)
    }
  })
  await page
    .locator('#prediction-text')
    .fill('Isian yang belum tersimpan tetap di layar.')
  await expect(page.locator('.draft-status')).toContainText('Belum tersimpan')
  await expect(page.locator('#prediction-text')).toHaveValue(
    'Isian yang belum tersimpan tetap di layar.',
  )
  await page.evaluate(() =>
    (window as unknown as { restoreStorage: () => void }).restoreStorage(),
  )
  await page
    .getByRole('button', { name: 'Coba simpan draf lagi', exact: true })
    .click()
  await expect(page.locator('.draft-status')).toContainText(
    'Tersimpan di perangkat ini',
  )
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await fillObservations(page)
  await page
    .locator('#reflection-reason')
    .fill('Saya membandingkan perubahan sakelar dengan pengamatan lampu.')
  await page.getByRole('radio', { name: /^A / }).check()
  await page.route('**/api/assessment', (r) => r.abort())
  await page
    .getByRole('button', { name: 'Periksa pilihan', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText('belum tersimpan')
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
          .profiles['demo:admin'].questions?.['phet:1'],
    ),
  ).toBeUndefined()
})

test('blocked image storage never claims a saved screenshot', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(indexedDB, 'open', {
      configurable: true,
      value: () => {
        throw new DOMException('Blocked', 'SecurityError')
      },
    })
  })
  await openMission(page)
  await predict(page)
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  const file = page.locator('.evidence-upload input')
  await expect(file).toBeEnabled()
  const buffer = await page.screenshot()
  await file.setInputFiles({
    name: 'circuit.png',
    mimeType: 'image/png',
    buffer,
  })
  await expect(
    page.getByRole('region', { name: 'Bukti rangkaian' }),
  ).toContainText('Bukti belum tersimpan.')
  await expect(page.locator('.evidence-preview')).toBeVisible()
  await expect(
    page.getByText('Bukti tersimpan di perangkat ini.', { exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Coba simpan bukti lagi', exact: true }),
  ).toBeVisible()
})
