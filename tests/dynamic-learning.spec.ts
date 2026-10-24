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

test('materi menawarkan formatif yang sama, revisi membuka materi berikutnya, dan challenge tetap terkunci', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Selamat datang, Ilmuwan Muda! ⚡' }),
  ).toBeVisible()
  await expect(page.locator('.learning-path-card')).toHaveCount(3)
  await expect(page.locator('.dashboard-circuit')).toHaveAttribute(
    'data-renderer',
    '3d',
  )
  await expect(
    page.getByRole('button', { name: 'Explore Lessons' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await expect(
    page.getByRole('button', { name: 'Formatif 1: Arus Listrik' }),
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Sumatif Listrik Dinamis' }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  await page.getByRole('button', { name: 'Explore Lessons' }).click()
  const secondMaterial = page.getByRole('button', {
    name: 'Hambatan Ohmik dan Non-Ohmik',
  })
  await expect(secondMaterial).toBeDisabled()
  await page.getByRole('button', { name: 'Arus Listrik' }).click()
  await expect(
    page.getByRole('heading', { name: 'Arus Listrik' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Materi selesai. Sekarang cek pemahamanmu melalui tes formatif.',
  )
  await page.getByRole('button', { name: 'Kembali ke daftar materi' }).click()
  await expect(secondMaterial).toBeDisabled()
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  await page.getByRole('button', { name: 'Start Challenge' }).click()
  await expect(
    page.getByRole('button', { name: 'Challenge 1: Arus Listrik' }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByText('KUIS FORMATIF 01', { exact: true }),
  ).toBeVisible()
  await page.getByLabel('Jawaban angka dalam C').fill('12000')
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.getByRole('status')).toContainText(
    'Ingat kembali materinya',
  )
  await expect(
    page.getByRole('button', { name: 'Lanjut ke materi berikutnya' }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Coba revisi jawaban' }).click()
  await page.getByRole('button', { name: 'Pelajari kembali materi' }).click()
  await expect(
    page.getByRole('heading', { name: 'Arus Listrik' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Kerjakan Tes Formatif' }).click()
  await page.getByLabel('Jawaban angka dalam C').fill('18000')
  await page.getByRole('button', { name: 'Periksa jawaban' }).click()
  await expect(page.getByRole('status')).toContainText('Kuis formatif selesai')
  await expect(
    page.getByRole('button', { name: 'Buka Challenge PhET' }),
  ).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Lanjut ke materi berikutnya' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Hambatan Ohmik dan Non-Ohmik' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await page.getByRole('button', { name: 'Kerjakan Tes Formatif' }).click()
  await expect(
    page.getByText('KUIS FORMATIF 02', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('textbox')).toHaveValue('')
  await expect(page.locator('.header-xp')).toContainText('0')
})

test('enam pasangan materi dan kuis dapat diselesaikan tanpa challenge sebagai prasyarat', async ({
  page,
}) => {
  test.setTimeout(60000)
  await page.goto('/')
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  const answers = ['18000', '20', '0,85', '8', '4,5', '320']
  for (const [index, answer] of answers.entries()) {
    const number = String(index + 1).padStart(2, '0')
    await expect(
      page.getByText(`MATERI ${number}`, { exact: true }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
    await page.getByRole('button', { name: 'Kerjakan Tes Formatif' }).click()
    await expect(
      page.getByText(`KUIS FORMATIF ${number}`, { exact: true }),
    ).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveValue('')
    await page.getByRole('textbox').fill(answer)
    await page.getByRole('button', { name: 'Periksa jawaban' }).click()
    await expect(page.getByRole('status')).toContainText('Jawabanmu tepat.')
    await page
      .getByRole('button', {
        name:
          index === 5 ? 'Kembali ke dashboard' : 'Lanjut ke materi berikutnya',
      })
      .click()
  }
  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await expect(
    page.getByRole('button', { name: 'Sumatif Listrik Dinamis' }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  await page.getByRole('button', { name: 'Start Challenge' }).click()
  await expect(
    page.getByRole('button', { name: 'Challenge 1: Arus Listrik' }),
  ).toBeEnabled()
  await expect(
    page.getByRole('button', { name: /Challenge 2:/ }),
  ).toBeDisabled()
  const progress = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!)
        .profiles['student:nara'],
  )
  expect(progress.challenges).toEqual([])
  expect(progress.materials).toEqual([1, 2, 3, 4, 5, 6])
  expect(
    Object.values(progress.quizzes).every(
      (quiz) => (quiz as { complete: boolean }).complete,
    ),
  ).toBe(true)
  await page.reload()
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(page.getByText('CHALLENGE 01', { exact: true })).toBeVisible()
})

test('progres lama dan profil lain dipertahankan saat meninjau kembali materi', async ({
  page,
}) => {
  const legacy = {
    version: 1,
    profiles: {
      'student:nara': {
        materials: [1, 2],
        challenges: [1],
        challengeDrafts: {
          1: {
            visited: true,
            observation: 'Catatan lama',
            reflection: 'Refleksi lama',
          },
        },
        quizzes: { 1: { answer: '12000', attempts: 2, complete: false } },
        summative: { answers: {}, essays: ['', ''], submitted: false },
      },
      'student:bima': {
        materials: [1],
        challenges: [],
        challengeDrafts: {},
        quizzes: {},
        summative: { answers: {}, essays: ['', ''], submitted: false },
      },
    },
  }
  await page.addInitScript(
    (saved) =>
      localStorage.setItem(
        'voltquest.dynamic-electricity.v1',
        JSON.stringify(saved),
      ),
    legacy,
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore Lessons' }).click()
  await page
    .getByRole('button', { name: 'Hambatan Ohmik dan Non-Ohmik' })
    .click()
  await expect(
    page.getByRole('button', { name: 'Kerjakan Tes Formatif' }),
  ).toBeDisabled()
  await expect(
    page.getByText(
      'Selesaikan kuis formatif sebelumnya untuk membuka kuis ini.',
    ),
  ).toBeVisible()
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
    ),
  ).toEqual(legacy)
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('voltquest.v1')!),
    ),
  ).toEqual(profile)
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByText('KUIS FORMATIF 01', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('textbox')).toHaveValue('12000')
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
  await page.getByRole('button', { name: 'Buka tahap berikutnya' }).click()
  await expect(
    page.getByRole('heading', { name: 'Listrik Dinamis' }),
  ).toBeVisible()
  await expect(page.getByText('Dua kawat tembaga X dan Y')).toBeVisible()
  await expect(
    page.getByText('tidak mengklaim menilai uraian secara otomatis'),
  ).toBeVisible()
})
