import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { PHET_URL } from '../src/data/missions'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ body: '', contentType: 'text/css' }),
  )
})
async function enter(page: Page, id = 3) {
  await page.addInitScript(() =>
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [], visited: [] },
        },
      }),
    ),
  )
  await page.goto(`/#misi-${id}`)
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await expect(
    page.getByRole('button', { name: '4 Refleksi', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
}

test('embedded simulation keeps its state while switching between guide and editable table', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  let requests = 0
  await page.route(PHET_URL, (route) => {
    requests++
    return route.fulfill({
      contentType: 'text/html',
      body: '<title>PhET test double</title><button onclick="this.textContent=\'Percobaan 1\'">Percobaan 0</button>',
    })
  })
  await enter(page)
  await expect(page.locator('iframe')).toHaveCount(0)
  await page.getByRole('button', { name: 'Mulai simulasi di sini' }).click()
  const frame = page.frameLocator('iframe')
  await frame.getByRole('button', { name: 'Percobaan 0' }).click()
  const node = await page.locator('iframe').elementHandle()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await expect(page.getByRole('table')).toHaveCount(1)
  expect(
    await page
      .locator('iframe')
      .evaluate((element, old) => element === old, node),
  ).toBe(true)
  await expect(frame.getByRole('button', { name: 'Percobaan 1' })).toBeVisible()
  expect(requests).toBe(1)
  for (const input of await page.locator('.observation-form input').all())
    await expect(input).toHaveValue('')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Hambatan resistor (Ω)')).toBeFocused()
  await expect(
    page.getByRole('button', { name: '4 Refleksi', exact: true }),
  ).toBeDisabled()
  await page.getByLabel('Hambatan resistor (Ω)').fill('7')
  await page.getByLabel('Tegangan A (V)').fill('4,5')
  await page.getByLabel('Arus A (A)').fill('0')
  await page.getByLabel('Tegangan B (V)').fill('9')
  await page.getByLabel('Arus B (A)').fill('1,25')
  await page.getByRole('button', { name: 'Kembali ke eksperimen' }).click()
  await expect(frame.getByRole('button', { name: 'Percobaan 1' })).toBeVisible()
  expect(requests).toBe(1)
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await expect(page.getByLabel('Arus B (A)')).toHaveValue('1,25')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText('1,25')
  await expect(
    page.getByRole('button', { name: '4 Refleksi', exact: true }),
  ).toBeEnabled()
  await page.reload()
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText('4,5')
  await expect(page.locator('.header-xp')).toContainText('0')
  await page.getByRole('button', { name: 'Kembali ke pengamatan' }).click()
  await page.getByLabel('Arus B (A)').fill('')
  await expect(
    page.getByRole('button', { name: '4 Refleksi', exact: true }),
  ).toBeDisabled()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Catat yang kamu amati' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Lanjut tanpa pengamatan' }),
  ).toHaveCount(0)
  expect(errors).toEqual([])
})

test('legacy skipped reflection opens incomplete table without rewriting stored answers or XP', async ({
  page,
}) => {
  const old = {
    version: 1,
    profiles: {
      'student:nara': {
        1: {
          step: 3,
          prediction: 'Belum yakin',
          observations: { open: 'Menyala', closed: '' },
          observationStatus: 'skipped',
          answer: 1,
          reflectionReason: 'Alasan lama',
        },
      },
    },
  }
  await page.addInitScript((old) => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [1], visited: [1] },
        },
      }),
    )
    localStorage.setItem('voltquest.experiments.v1', JSON.stringify(old))
  }, old)
  await page.goto('/#misi-1')
  await expect(
    page.getByRole('heading', { name: 'Catat yang kamu amati' }),
  ).toBeVisible()
  await expect(page.getByLabel('Lampu saat sakelar terbuka')).toHaveValue(
    'Menyala',
  )
  await expect(
    page.getByRole('button', { name: '4 Refleksi', exact: true }),
  ).toBeDisabled()
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('voltquest.experiments.v1')!),
    ),
  ).toEqual(old)
  await expect(page.locator('.header-xp')).toContainText('100')
  // A surprising observation is accepted; no expected-result answer is forced.
  await page.getByLabel('Lampu saat sakelar tertutup').selectOption('Padam')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
  await expect(page.getByLabel('Ringkasan kegiatan')).toContainText('Padam')
  await expect(page.getByLabel('Berdasarkan pengamatanmu')).toHaveValue(
    'Alasan lama',
  )
  await expect(page.locator('input[name="answer"][value="1"]')).toBeChecked()
  await expect(page.locator('.header-xp')).toContainText('100')
})

test('slow simulation retains table access and a fallback link; unsupported fullscreen has a useful message', async ({
  page,
}) => {
  await page.clock.install()
  await page.route(PHET_URL, () => {})
  await enter(page, 1)
  await page.getByRole('button', { name: 'Mulai simulasi di sini' }).click()
  await page.clock.fastForward(19000)
  await expect(page.getByRole('status')).toContainText('Simulasi belum tampil')
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await page.getByLabel('Lampu saat sakelar terbuka').selectOption('Padam')
  await expect(page.getByLabel('Lampu saat sakelar terbuka')).toHaveValue(
    'Padam',
  )
  await expect(
    page.getByRole('link', { name: /Buka Laboratorium PhET/ }),
  ).toHaveAttribute('target', '_blank')
  await page.evaluate(() =>
    Object.defineProperty(
      document.querySelector('.phet-stage'),
      'requestFullscreen',
      { value: undefined },
    ),
  )
  await page.getByRole('button', { name: 'Layar penuh', exact: true }).click()
  await expect(
    page.getByText('Layar penuh belum didukung browser ini.', { exact: false }),
  ).toBeVisible()
})

test('fullscreen and responsive embedded frame leave the table and main page usable', async ({
  page,
}, info) => {
  await page.route(PHET_URL, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<title>PhET test double</title>Simulasi uji untuk pemeriksaan layout, bukan PhET asli.',
    }),
  )
  await enter(page, 2)
  await page.getByRole('button', { name: 'Mulai simulasi di sini' }).click()
  await page.getByRole('button', { name: 'Layar penuh', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Keluar layar penuh' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Keluar layar penuh' }).click()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const region = page.getByRole('region', {
      name: 'Tabel pengamatan, dapat digeser',
    })
    await region.focus()
    await expect(region).toBeFocused()
    for (const select of await page.locator('.observation-form select').all()) {
      const box = await select.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    if (info.project.name === 'desktop' && [390, 1440].includes(width))
      await page.screenshot({
        path: `artifacts/embedded-lab/controlled-frame-${width}.png`,
        fullPage: true,
      })
  }
})
