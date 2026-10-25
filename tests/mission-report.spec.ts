import { test, expect, type Page } from '@playwright/test'
import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'
import { prepareMission } from './helpers/phet-mission'
import { fillObservations } from './helpers/observations'

test.beforeEach(async ({ page }) => {
  test.setTimeout(120000)
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
async function open(page: Page, title = 'Komponen Rangkaian') {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Start Exploring', exact: true })
    .click()
  await page.getByRole('button', { name: title, exact: true }).click()
}
async function counts(page: Page) {
  return page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem('voltquest.dynamic-electricity.v1') ?? '{}',
      ).profiles?.['demo:admin']?.questions?.['phet:1'],
  )
}

test('mobile upload fallback, report snapshot, feedback order and downloadable Unicode PDF', async ({
  page,
}, info) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'createImageBitmap', {
      configurable: true,
      value: undefined,
    }),
  )
  await open(page)
  await page.getByRole('radio', { name: 'Prediksi lain', exact: true }).check()
  await page
    .locator('#prediction-text')
    .fill('Lampu mungkin berubah ketika sakelar ditutup.')
  await page
    .locator('#prediction-reason')
    .fill('Saya ingin membandingkan keadaan lampu dalam dua kondisi sakelar.')
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await expect(page.locator('.evidence-upload input')).toBeEnabled()
  await page
    .locator('.evidence-upload input')
    .setInputFiles({
      name: 'too-large.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(6 * 1024 * 1024 + 1),
    })
  await expect(
    page.getByRole('region', { name: 'Bukti rangkaian' }),
  ).toContainText('maksimal 6 MB')
  const buffer = existsSync('tmp/phet-real.png')
    ? readFileSync('tmp/phet-real.png')
    : await page.screenshot()
  await page
    .locator('.evidence-upload input')
    .setInputFiles({ name: 'screenshot-galeri.jpg', mimeType: '', buffer })
  await expect(
    page.getByText('Bukti tersimpan di perangkat ini.', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await fillObservations(page)
  await page.getByRole('radio', { name: /^B / }).check()
  await page
    .getByRole('button', { name: 'Periksa pilihan', exact: true })
    .click()
  await expect(page.locator('.feedback.success')).toContainText(
    'Pilihan jawabanmu tepat.',
  )
  expect((await counts(page)).status).toBe('open')
  const feedback = await page.locator('.feedback.success').boundingBox(),
    label = await page.locator('label[for="reflection-reason"]').boundingBox()
  expect(feedback!.y + feedback!.height).toBeLessThanOrEqual(label!.y)
  await expect(
    page.getByRole('region', { name: 'Catatan Pemahaman' }),
  ).toHaveCount(0)
  const original =
    'Saya membandingkan keadaan lampu, sakelar, dan sambungan pada dua kondisi. V = IR; hambatan Ω, resistivitas ρ dan jumlah arus Σ I perlu diperhatikan ketika menganalisis bukti. '
      .repeat(5)
      .slice(0, 790)
  await page.locator('#reflection-reason').fill(original)
  await page
    .getByRole('button', { name: 'Kirim dan Lihat Laporan', exact: true })
    .click()
  const report = page.getByRole('region', { name: 'Laporan Eksperimen' })
  await expect(report).toBeVisible()
  // A correct choice does not certify contradictory observation data.
  await expect(report).toContainText('Perlu penguatan')
  await expect(report).toContainText(original)
  await expect(report.locator('img')).toBeVisible()
  await expect(report).toContainText('Pembahasan AI belum tersedia')
  const before = await counts(page)
  mkdirSync('tmp/pdfs', { recursive: true })
  const download = page.waitForEvent('download')
  await page
    .getByRole('button', { name: 'Unduh Laporan Eksperimen', exact: true })
    .click()
  const file = await download
  expect(file.suggestedFilename()).toBe(
    'VoltQuest_Komponen-Rangkaian_Admin.pdf',
  )
  const path = `tmp/pdfs/mission-polish-${info.project.name}.pdf`
  await file.saveAs(path)
  const pdf = await PDFDocument.load(readFileSync(path))
  expect(pdf.getPageCount()).toBeGreaterThan(1)
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    if (width === 1440 || width === 390)
      await page.screenshot({
        path: `tmp/report-${info.project.name}-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      })
  }
  await page
    .getByRole('button', { name: 'Perbaiki Jawaban', exact: true })
    .click()
  await page
    .locator('#reflection-reason')
    .fill('NASKAH BARU YANG BELUM DIKIRIM')
  await page
    .getByRole('button', { name: 'Lihat laporan tersimpan', exact: true })
    .click()
  await expect(report).toContainText('belum diperbarui')
  await expect(report).not.toContainText('NASKAH BARU YANG BELUM DIKIRIM')
  expect(await counts(page)).toEqual(before)
})

test('all five observation layouts fit without horizontal scrolling and headings do not look interactive', async ({
  page,
}) => {
  for (const title of [
    'Komponen Rangkaian',
    'Hukum Ohm',
    'Seri dan Paralel',
    'Daya Listrik',
    'Sekolah Tangguh Energi',
  ]) {
    await open(page, title)
    await page
      .getByRole('radio', { name: 'Prediksi lain', exact: true })
      .check()
    await page
      .locator('#prediction-text')
      .fill('Saya ingin melihat perubahan rangkaian.')
    await page
      .locator('#prediction-reason')
      .fill('Saya akan menguji dan mencatat hasilnya.')
    await page
      .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
      .click()
    const heading = page.getByRole('heading', {
      name: 'Siapkan Eksperimenmu',
      exact: true,
    })
    await heading.focus()
    expect(
      await heading.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe('none')
    await page
      .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
      .click()
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 950 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      if (width <= 390)
        expect(
          await page
            .locator('.observation-table-scroll')
            .evaluate((el) => el.scrollWidth <= el.clientWidth),
        ).toBe(true)
    }
  }
})

test('four wrong choices produce one feedback card and final report without another attempt or XP', async ({
  page,
}) => {
  await open(page)
  await prepareMission(page)
  await page.getByRole('radio', { name: /^A / }).check()
  for (let i = 1; i <= 4; i++) {
    if (i > 1) await page.waitForTimeout(950)
    await page
      .getByRole('button', { name: 'Periksa pilihan', exact: true })
      .click()
    await expect(page.locator('.feedback.retry')).toBeVisible()
    expect((await counts(page)).wrong).toBe(i)
  }
  await expect(page.locator('.feedback.retry')).toHaveCount(1)
  await page
    .getByRole('button', { name: 'Lanjut dengan penguatan', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Kirim dan Lihat Laporan', exact: true })
    .click()
  await expect(
    page.getByRole('region', { name: 'Laporan Eksperimen' }),
  ).toContainText('Perlu penguatan')
  expect((await counts(page)).wrong).toBe(4)
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.v1')!).profiles['demo:admin']
          .completed,
    ),
  ).toEqual([])
})

test('correct choice with unknown explanation is reported as support, not full understanding', async ({
  page,
}) => {
  await open(page)
  await prepareMission(page)
  await page.getByRole('radio', { name: /^B / }).check()
  await page
    .getByRole('button', { name: 'Periksa pilihan', exact: true })
    .click()
  await page.locator('#reflection-reason').fill('ga tau')
  await page
    .getByRole('button', { name: 'Kirim dan Lihat Laporan', exact: true })
    .click()
  await expect(
    page.getByRole('region', { name: 'Laporan Eksperimen' }),
  ).toContainText('Penjelasan refleksi belum menunjukkan hubungan')
  expect((await counts(page)).status).toBe('reinforcement')
  expect((await counts(page)).wrong).toBe(0)
})
