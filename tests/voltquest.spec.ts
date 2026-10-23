import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function login(page: Page, name = 'Nara') {
  await page.goto('/')
  await page.getByRole('button', { name: 'Masuk atau Daftar' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill(name)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: `Halo, ${name}!` }),
  ).toBeVisible()
}

async function skipToReflection(page: Page) {
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut tanpa pengamatan', exact: true })
    .click()
}

test('full journey, reflection, persistence, no duplicate XP, and profiles', async ({
  page,
}) => {
  test.setTimeout(90000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await login(page)
  await expect(page.locator('.mission-card')).toHaveCount(5)
  await page.getByLabel('Cari misi').fill('ohm')
  await expect(page.locator('.mission-card')).toHaveCount(1)
  await page.getByLabel('Hapus pencarian').click()
  await page.getByRole('button', { name: 'Mulai misi pertama' }).click()
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  const lab = page.getByRole('link', { name: 'Buka Laboratorium PhET' })
  await expect(lab).toHaveAttribute('target', '_blank')
  await expect(lab).toHaveAttribute(
    'href',
    'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
  )
  // Stub the external simulation so the test only checks our tab-opening integration.
  await page
    .context()
    .route('https://phet.colorado.edu/**', (route) =>
      route.fulfill({ body: '<title>PhET lab</title>Laboratorium eksternal' }),
    )
  const popupPromise = page.waitForEvent('popup')
  await lab.click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/phet.colorado.edu/)
  await popup.close()
  await expect(
    page.getByText('Tautan laboratorium sudah dibuka.', { exact: false }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut tanpa pengamatan', exact: true })
    .click()
  await expect(
    page.getByText('Belum mencatat pengamatan', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Kirim jawaban' }),
  ).toBeDisabled()
  await page.getByRole('radio', { name: 'A Kabel', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban' }).click()
  await expect(page.getByRole('status')).toContainText('Coba pikirkan lagi')
  await expect(page.locator('.header-xp')).toContainText('0')
  const answers = [
    'B Baterai',
    'C Paralel',
    'D 6 Ω',
    'C Perangkat berdaya lebih kecil',
    'B Rangkaian paralel dengan sakelar tiap ruang',
  ]
  for (let i = 0; i < answers.length; i++) {
    if (i > 0) await skipToReflection(page)
    await page.getByRole('radio', { name: answers[i], exact: true }).check()
    await page.getByRole('button', { name: 'Kirim jawaban' }).click()
    await expect(page.getByRole('status')).toContainText('+100 XP')
    await expect(page.locator('.header-xp')).toContainText(
      String((i + 1) * 100),
    )
    await page
      .getByRole('button', {
        name: i === 4 ? 'Kembali ke dashboard' : 'Lanjut ke misi berikutnya',
      })
      .click()
  }
  await expect(page.getByText('5/5 misi', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('.header-xp')).toContainText('500')
  await expect(page.locator('.mission-card .is-complete')).toHaveCount(5)
  await page
    .getByRole('button', { name: /Badge saya/i })
    .filter({ visible: true })
    .click()
  await expect(page.getByRole('dialog')).toContainText('5 dari 5 badge')
  await expect(page.locator('.badge-check')).toHaveCount(5)
  await page.getByRole('button', { name: 'Tutup', exact: true }).click()
  await page.getByRole('button', { name: 'Jelajahi misi lagi' }).click()
  await expect(
    page.getByRole('heading', { name: 'Hubungkan hasil dengan konsep' }),
  ).toBeVisible()
  await page.getByRole('radio', { name: 'B Baterai', exact: true }).check()
  await page.getByRole('button', { name: 'Kirim jawaban' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Coba jelaskan alasannya',
  )
  await expect(page.locator('.header-xp')).toContainText('500')
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Bima')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.header-xp')).toContainText('0')
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.header-xp')).toContainText('500')
  expect(errors).toEqual([])
})

test('responsive layout, empty search, and accessible dialogs', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await page.screenshot({
    path: `test-results/onboarding-${testInfo.project.name}.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByRole('button', { name: /Sudah punya kelas/ }).click()
  await page.getByLabel('Kode dari guru').fill('FISIKA-01')
  await page.getByRole('button', { name: 'Periksa kode' }).click()
  await expect(page.getByRole('status')).toContainText(
    'belum dapat diverifikasi',
  )
  await page.getByRole('button', { name: 'Lanjutkan ke demo' }).click()
  await page
    .getByLabel('Siapa nama panggilanmu?')
    .fill('Penjelajah Dengan Nama Panjang Sekali')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  }
  await page.setViewportSize(
    testInfo.project.name === 'mobile'
      ? { width: 390, height: 844 }
      : { width: 1440, height: 1000 },
  )
  await page.screenshot({
    path: `test-results/dashboard-${testInfo.project.name}.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByLabel('Cari misi').fill('tidak ada')
  await expect(page.getByText('Belum ada misi yang cocok')).toBeVisible()
  await page.getByRole('button', { name: 'Tampilkan semua misi' }).click()
  await expect(page.locator('.mission-card')).toHaveCount(5)
  await page.getByRole('button', { name: 'Selesai', exact: true }).click()
  await expect(page.getByText('Badge pertamamu menunggu!')).toBeVisible()
  await page.getByRole('button', { name: 'Tampilkan semua misi' }).click()
  await page.getByRole('button', { name: 'Mulai misi pertama' }).click()
  await page.screenshot({
    path: `test-results/mission-${testInfo.project.name}.png`,
    fullPage: true,
    animations: 'disabled',
  })
  await page.getByLabel('Buka profil siswa').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const close = page
    .getByRole('dialog')
    .getByRole('button', { name: 'Tutup', exact: true })
  const logout = page
    .getByRole('dialog')
    .getByRole('button', { name: 'Keluar dari profil' })
  await logout.focus()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(logout).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByLabel('Buka profil siswa')).toBeFocused()
})

test('invalid saved state recovers gracefully', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('voltquest.v1', '{invalid-json'),
  )
  await page.goto('/')
  await expect(
    page.getByRole('button', { name: 'Masuk atau Daftar' }),
  ).toBeVisible()
})
