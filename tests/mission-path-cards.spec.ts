import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.addInitScript(() => {
    localStorage.setItem(
      'voltquest.v1',
      JSON.stringify({
        active: 'student:nara',
        profiles: {
          'student:nara': { name: 'Nara', completed: [], visited: [] },
        },
      }),
    )
  })
})

test('mission cards fit five viewport widths and support full-card clicks and keyboard', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    const cards = page.locator('.mission-path-card')
    await expect(cards).toHaveCount(3)
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true)
    const bounds = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const card = element.getBoundingClientRect()
        const emoji = element
          .querySelector('.mission-card-emoji')!
          .getBoundingClientRect()
        const action = element.querySelector('button')!.getBoundingClientRect()
        const steps = element
          .querySelector('.mission-card-steps')!
          .getBoundingClientRect()
        return {
          x: card.x,
          y: card.y,
          right: card.right,
          emojiLeft: emoji.left,
          emojiRight: emoji.right,
          actionLeft: action.left,
          actionRight: action.right,
          actionHeight: action.height,
          stepsLeft: steps.left,
          stepsRight: steps.right,
          stepChildrenFit: [...element.querySelectorAll('.mission-step')].every(
            (step) => step.getBoundingClientRect().right <= steps.right + 1,
          ),
        }
      }),
    )
    for (const bound of bounds) {
      expect(bound.emojiLeft).toBeGreaterThanOrEqual(bound.x)
      expect(bound.emojiRight).toBeLessThanOrEqual(bound.right)
      expect(bound.actionLeft).toBeGreaterThanOrEqual(bound.x)
      expect(bound.actionRight).toBeLessThanOrEqual(bound.right)
      expect(bound.actionHeight).toBeGreaterThanOrEqual(44)
      expect(bound.stepChildrenFit).toBe(true)
    }
    if (width >= 768)
      expect(new Set(bounds.map((bound) => Math.round(bound.y))).size).toBe(1)
    else expect(bounds[1].y).toBeGreaterThan(bounds[0].y)
    if (width === 1440 || width === 390) {
      await page.screenshot({
        path: `tmp/mission-cards-${width}-${testInfo.project.name}.png`,
        fullPage: true,
      })
    }
  }
  const titles = ['Learning Path', 'PhET Challenge', 'Quizzes & Assessment']
  await expect(page.locator('.mission-card-emoji')).toHaveText([
    '📚',
    '🔬',
    '📝',
  ])
  await expect(
    page.locator(
      '.mission-card-medallion, .mission-card-circuit, .mission-card-garden',
    ),
  ).toHaveCount(0)
  for (const title of titles)
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible()
  await expect(page.locator('.learning-path-grid')).not.toContainText(
    /6 Topik|Eksperimen|Formatif \+ Sumatif/,
  )

  // The stretched action target makes the header and body work as one card.
  await page
    .locator('.mission-path-lessons')
    .click({ position: { x: 12, y: 12 } })
  await expect(
    page.getByRole('heading', { name: 'Materi Listrik Dinamis', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  const challenge = page.getByRole('button', {
    name: 'Start Challenge',
    exact: true,
  })
  await challenge.focus()
  await challenge.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Challenge Analisis PhET', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Kembali ke Listrik Dinamis' }).click()
  await page
    .getByRole('button', { name: 'Test Your Knowledge', exact: true })
    .press('Space')
  await expect(
    page.getByRole('heading', { name: 'Kuis dan Asesmen', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Formatif 1: Arus Listrik' }),
  ).toBeDisabled()
})

test('rails reflect saved profile progress and keep summative locked until all six quizzes are done', async ({
  page,
}) => {
  const saved = {
    version: 1,
    profiles: {
      'student:nara': {
        materials: [1, 2, 3],
        challenges: [1],
        challengeDrafts: {},
        quizzes: {
          '1': { answer: '18000', attempts: 1, complete: true },
          '2': { answer: '20', attempts: 1, complete: true },
        },
        summative: { answers: {}, essays: ['', ''], submitted: false },
      },
      'student:other': {
        materials: [],
        challenges: [],
        challengeDrafts: {},
        quizzes: {},
        summative: { answers: {}, essays: ['', ''], submitted: false },
      },
    },
  }
  await page.addInitScript(
    (value) =>
      localStorage.setItem(
        'voltquest.dynamic-electricity.v1',
        JSON.stringify(value),
      ),
    saved,
  )
  await page.goto('/')
  const lessons = page.locator('.mission-path-lessons')
  const challenge = page.locator('.mission-path-challenge')
  const quiz = page.locator('.mission-path-assessment')
  await expect(lessons.locator('.mission-step.done')).toHaveCount(3)
  await expect(lessons.locator('.mission-step.locked')).toHaveCount(3)
  await expect(challenge.locator('.mission-step.done')).toHaveCount(1)
  await expect(challenge.locator('.mission-step.active')).toHaveCount(1)
  await expect(challenge.locator('.mission-step.next')).toHaveCount(1)
  await expect(quiz.locator('.mission-step.done')).toHaveCount(2)
  await expect(quiz.locator('.mission-step.active')).toHaveCount(1)
  await expect(quiz.locator('.mission-step').last()).toHaveAttribute(
    'aria-label',
    /Sumatif.*Locked/,
  )
  await expect(quiz.locator('.mission-card-count')).toContainText('2 / 7')
  await page.getByRole('button', { name: 'Test Your Knowledge' }).click()
  await expect(
    page.getByRole('button', { name: 'Sumatif Listrik Dinamis' }),
  ).toBeDisabled()
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem('voltquest.dynamic-electricity.v1')!),
    ),
  ).toEqual(saved)
})
