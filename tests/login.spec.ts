import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
})

test('email validation, reveal, invalid credentials, remembered email and loading success', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByLabel('Email', { exact: true })).toBeFocused()
  await expect(
    page.getByText('Masukkan alamat email yang valid.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
  await page.getByRole('button', { name: 'Tampilkan kata sandi' }).click()
  await expect(page.getByLabel('Kata sandi', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.getByLabel('Kata sandi', { exact: true }).fill('salah1234')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('belum cocok')
  await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
  await page.getByLabel('Ingat saya').check()
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Memproses' })).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Berhasil masuk' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Halo, Penjelajah!' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('voltquest.v1')!).active,
    ),
  ).toBe('account:siswa@voltquest.demo')
  await page.getByLabel('Buka profil siswa').click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
    'siswa@voltquest.demo',
  )
  await expect(page.getByLabel('Kata sandi', { exact: true })).toHaveValue('')
  await page.getByLabel('Ingat saya').uncheck()
  await page.getByLabel('Kata sandi', { exact: true }).fill('VoltQuest123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.dashboard')).toBeVisible()
  expect(
    await page.evaluate(() =>
      localStorage.getItem('voltquest.remembered-email.v1'),
    ),
  ).toBe(null)
})

test('local registration, duplicate guard, recovery and separate email profiles', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('voltquest.v1'))
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: null,
          profiles: {
            'student:alya': { name: 'Alya', completed: [1], visited: [1] },
          },
        }),
      )
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Alya')
  await page.getByLabel('Email', { exact: true }).fill('alya@example.test')
  await page.getByLabel('Kata sandi', { exact: true }).fill('Contoh12345')
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await expect(page.getByLabel('Kode pemulihan')).toBeVisible()
  const code = await page.getByLabel('Kode pemulihan').inputValue()
  expect(code.length).toBeGreaterThan(20)
  const stored = await page.evaluate(() =>
    localStorage.getItem('voltquest.accounts.v1'),
  )
  expect(stored).not.toContain('Contoh12345')
  expect(stored).not.toContain(code)
  await page
    .getByRole('button', { name: 'Sudah disimpan, lanjut masuk' })
    .click()
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await page.getByLabel('Kata sandi', { exact: true }).fill('Contoh12345')
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('sudah terdaftar')
  await page.getByRole('button', { name: 'Kembali ke login email' }).click()
  await page.getByRole('button', { name: 'Lupa kata sandi?' }).click()
  await page.getByLabel('Kode pemulihan').fill('kode salah')
  await page.getByLabel('Kata sandi baru').fill('Ganti12345')
  await page.getByRole('button', { name: 'Simpan kata sandi baru' }).click()
  await expect(page.getByRole('alert')).toContainText('belum cocok')
  await page.getByLabel('Kode pemulihan').fill(code)
  await page.getByRole('button', { name: 'Simpan kata sandi baru' }).click()
  await expect(
    page.getByText('Kata sandi lokal diperbarui.', { exact: false }),
  ).toBeVisible()
  await page.getByLabel('Kata sandi', { exact: true }).fill('Contoh12345')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('belum cocok')
  await page.getByLabel('Kata sandi', { exact: true }).fill('Ganti12345')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Halo, Alya!' })).toBeVisible()
  await expect(page.locator('.header-xp')).toContainText('0')
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.v1')!).profiles[
          'student:alya'
        ].completed,
    ),
  ).toEqual([1])
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Halo, Alya!' })).toBeVisible()
})

test('corrupt account storage is retained and built-in demo still works', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('voltquest.accounts.v1', 'null'),
  )
  await page.goto('/')
  await page.getByLabel('Email', { exact: true }).fill('nara@example.test')
  await page.getByLabel('Kata sandi', { exact: true }).fill('Contoh1234')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.auth-error')).toContainText(
    'Data akun lokal tidak dapat dibaca',
  )
  expect(
    await page.evaluate(() => localStorage.getItem('voltquest.accounts.v1')),
  ).toBe('null')
  await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.locator('.dashboard')).toBeVisible()
})

test('storage failure keeps demo usable and does not falsely register an account', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'QuotaExceededError')
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
  await page.getByLabel('Email', { exact: true }).fill('nara@example.test')
  await page.getByLabel('Kata sandi', { exact: true }).fill('Contoh1234')
  await page.getByRole('button', { name: 'Daftar', exact: true }).click()
  await expect(page.locator('.auth-error')).toContainText(
    'Penyimpanan perangkat tidak tersedia',
  )
  await expect(page.getByLabel('Kode pemulihan')).toHaveCount(0)
  await page.getByRole('button', { name: 'Coba dengan akun demo' }).click()
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Halo, Penjelajah!' }),
  ).toBeVisible()
})
