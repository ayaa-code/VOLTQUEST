import { expect, test } from '@playwright/test'

const profile = {
  active: 'student:nara',
  profiles: {
    'student:nara': { name: 'Nara', completed: [], visited: [] },
  },
}

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.addInitScript((progress) => {
    localStorage.setItem('voltquest.v1', JSON.stringify(progress))
  }, profile)
})

test('menjalankan materi, analisis PhET, dan revisi kuis formatif secara berurutan', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Petualangan Listrik Dinamis' })).toBeVisible()
  await expect(page.locator('.learning-path-card')).toHaveCount(3)
  await expect(page.locator('.dashboard-circuit')).toHaveAttribute('data-renderer', '3d')
  await expect(
    page.getByRole('button', { name: 'Buka daftar Materi Listrik Dinamis' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Lanjutkan belajar' }).click()
  await expect(page.getByRole('heading', { name: 'Arus Listrik' })).toBeVisible()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await page.getByRole('button', { name: 'Lihat progres belajar' }).click()

  const challengeCard = page
    .locator('.learning-path-card')
    .filter({ hasText: 'Challenge Analisis PhET' })
  await challengeCard.click()
  await page.getByRole('button', { name: 'Challenge 1: Arus Listrik' }).click()
  await page.getByRole('button', { name: 'Mulai simulasi di sini' }).click()
  await page.locator('textarea').nth(0).fill('Arus terlihat mengalir saat rangkaian tertutup.')
  await page.locator('textarea').nth(1).fill('Arus memerlukan lintasan tertutup untuk mengalir.')
  await expect(page.getByRole('button', { name: 'Selesaikan challenge' })).toBeEnabled()
  await page.getByRole('button', { name: 'Selesaikan challenge' }).click()
  await page.getByRole('button', { name: 'Kembali ke progres' }).click()

  const quizCard = page
    .locator('.learning-path-card')
    .filter({ hasText: 'Kuis dan Asesmen' })
  await quizCard.click()
  await page.getByRole('button', { name: 'Formatif 1: Arus Listrik' }).click()
  await page.getByLabel('Jawaban angka dalam C').fill('12000')
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.getByRole('status')).toContainText('Ingat kembali materinya')
  await page.getByRole('button', { name: 'Coba revisi jawaban' }).click()
  await page.getByLabel('Jawaban angka dalam C').fill('18000')
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.getByRole('status')).toContainText('Kuis formatif selesai')
})

test('membuka sumatif hanya setelah enam kuis formatif tersimpan pada profil siswa', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const quizzes = Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map((id) => [
        id,
        { answer: 'benar', attempts: 1, complete: true },
      ]),
    )
    localStorage.setItem(
      'voltquest.dynamic-electricity.v1',
      JSON.stringify({
        version: 1,
        profiles: {
          'student:nara': {
            materials: [1, 2, 3, 4, 5, 6],
            challenges: [1, 2, 3, 4, 5, 6],
            challengeDrafts: {},
            quizzes,
            summative: { answers: {}, essays: ['', ''], submitted: false },
          },
        },
      }),
    )
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Lanjutkan belajar' }).click()
  await expect(page.getByRole('heading', { name: 'Listrik Dinamis' })).toBeVisible()
  await expect(page.getByText('Dua kawat tembaga X dan Y')).toBeVisible()
  await expect(page.getByText('tidak mengklaim menilai uraian secara otomatis')).toBeVisible()
})
