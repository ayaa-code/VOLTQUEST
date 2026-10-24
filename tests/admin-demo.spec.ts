import { test, expect, type Page } from '@playwright/test'
import { learningAccess } from '../src/data/learningAccess'
import type { ProfileLearning } from '../src/hooks/useDynamicLearning'

test('demo access depends on reserved profile identity, never display name', () => {
  const empty: ProfileLearning = {
    materials: [],
    quizzes: {},
    challenges: [],
    challengeDrafts: {},
    summative: { answers: {}, essays: ['', ''], submitted: false },
  }
  const demo = learningAccess(empty, 'demo:admin')
  for (const id of [1, 2, 3, 4, 5, 6]) expect(demo.materialReady(id)).toBe(true)
  expect(demo.quizReady(1)).toBe(true)
  expect(demo.quizReady(2)).toBe(true)
  expect(demo.challengeReady(1)).toBe(true)
  expect(demo.summativeReady).toBe(true)
  for (const profile of ['student:admin', 'account:admin@example.test', null]) {
    expect(learningAccess(empty, profile).materialReady(2)).toBe(false)
    expect(learningAccess(empty, profile).quizReady(1)).toBe(false)
    expect(learningAccess(empty, profile).summativeReady).toBe(false)
  }
  expect(empty.materials).toEqual([])
})
async function login(page: Page, user = 'admin', password = 'admin') {
  await page.getByLabel('Email atau username', { exact: true }).fill(user)
  await page.getByLabel('Kata sandi', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
}
async function home(page: Page) {
  await page
    .getByRole('button', { name: 'Kembali ke Listrik Dinamis', exact: true })
    .click()
}
test('admin login opens all stages, keeps progress honest, saves separately, and logout restores student gates', async ({
  page,
}, info) => {
  test.setTimeout(90000)
  await page.route('https://fonts.googleapis.com/**', (r) =>
    r.fulfill({ body: '' }),
  )
  await page.addInitScript(() => {
    if (!localStorage.getItem('voltquest.v1'))
      localStorage.setItem(
        'voltquest.v1',
        JSON.stringify({
          active: null,
          profiles: {
            'student:admin': { name: 'admin', completed: [1], visited: [1] },
          },
        }),
      )
  })
  await page.goto('/')
  await expect(
    page.getByLabel('Email atau username', { exact: true }),
  ).toBeVisible()
  await page.screenshot({
    path: `tmp/admin-login-${info.project.name}.png`,
    fullPage: true,
  })
  await login(page, 'admin', 'wrong')
  await expect(page.getByRole('alert')).toContainText('belum cocok')
  await login(page)
  await expect(
    page.getByRole('heading', { name: 'Selamat datang, Ilmuwan Muda! ⚡' }),
  ).toBeVisible()
  await expect(page.locator('.header-right')).toContainText('Demo')
  await expect(page.locator('.learning-progress strong').last()).toHaveText(
    '0%',
  )
  await page.waitForTimeout(500)
  await page.screenshot({
    path: `tmp/admin-dashboard-${info.project.name}.png`,
    fullPage: true,
  })
  await page
    .getByRole('button', { name: 'Explore Lessons', exact: true })
    .click()
  await expect(page.locator('.path-row:disabled')).toHaveCount(0)
  await expect(page.locator('.path-row')).toHaveCount(6)
  await page.getByRole('button', { name: 'Daya Listrik', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Dengarkan materi', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Putar video Daya Listrik' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Tandai sudah dipelajari' }).click()
  await home(page)
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await expect(page.locator('.path-row:disabled')).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Formative Checkpoint 1', exact: true })
    .click()
  await expect(page.locator('.cq-canvas')).toBeVisible()
  await home(page)
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Formative Checkpoint 2', exact: true })
    .click()
  for (const [name, value] of [
    ['Arus utama (A)', '9'],
    ['Tegangan R3 (V)', '6'],
    ['Arus R1 (A)', '1'],
  ])
    await page.getByLabel(name, { exact: true }).fill(value)
  await page.getByRole('button', { name: 'Check System', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Belum tepat')
  await home(page)
  await page
    .getByRole('button', { name: 'Start Challenge', exact: true })
    .click()
  await page.getByRole('button', { name: 'Challenge', exact: true }).click()
  await page.locator('#a0lamp').fill('Lampu padam pada rangkaian terbuka')
  await page.getByRole('button', { name: 'Simpan draf', exact: true }).click()
  await home(page)
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Sumatif Listrik Dinamis', exact: true })
    .click()
  await expect(page.locator('.summative-detail')).toBeVisible()
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
  )
  expect(saved.profiles['demo:admin'].materials).toEqual([6])
  expect(saved.profiles['demo:admin'].summative.submitted).toBe(false)
  expect(saved.profiles['demo:admin'].checkpoints[2].complete).toBe(false)
  expect(saved.profiles['demo:admin'].worksheet).toBeTruthy()
  expect(saved.profiles['student:admin']).toBeUndefined()
  await page.getByRole('button', { name: 'Buka profil siswa' }).click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await login(page, 'siswa@voltquest.demo', 'VoltQuest123')
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Formative Checkpoint 1', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('button', { name: 'Sumatif Listrik Dinamis', exact: true }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Buka profil siswa' }).click()
  await page.getByRole('button', { name: 'Keluar dari profil' }).click()
  await login(page)
  await page
    .getByRole('button', { name: 'Explore Lessons', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Daya Listrik', exact: true }),
  ).toContainText('Selesai')
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('voltquest.v1')!).profiles[
          'student:admin'
        ].completed,
    ),
  ).toEqual([1])
})
