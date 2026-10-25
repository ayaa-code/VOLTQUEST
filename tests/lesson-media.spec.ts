import { expect, test } from '@playwright/test'
import { lessons } from '../src/data/lessons'

declare global {
  interface Window {
    lessonSpeechProbe: {
      spoken: SpeechSynthesisUtterance[]
      cancels: number
      pauses: number
      resumes: number
      voices: SpeechSynthesisVoice[]
      events: EventTarget
    }
    lessonVideoError?: (event: { data: number }) => void
  }
}

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  )
  await page.route('https://www.youtube-nocookie.com/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Test YouTube player</title>',
    }),
  )
  await page.route('https://www.youtube.com/iframe_api', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.YT = { Player: function(element, options) { window.lessonVideoError = options.events.onError; this.destroy = function() { element.remove(); }; } }; window.onYouTubeIframeAPIReady();`,
    }),
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
    const ids = [1, 2, 3, 4, 5, 6]
    localStorage.setItem(
      'voltquest.dynamic-electricity.v1',
      JSON.stringify({
        version: 1,
        profiles: {
          'student:nara': {
            materials: ids,
            quizzes: Object.fromEntries(
              ids.map((id) => [
                id,
                { answer: '', attempts: 1, complete: true },
              ]),
            ),
            challenges: [],
            challengeDrafts: {},
            summative: { answers: {}, essays: ['', ''], submitted: false },
          },
        },
      }),
    )
    const events = new EventTarget()
    const probe = (window.lessonSpeechProbe = {
      spoken: [],
      cancels: 0,
      pauses: 0,
      resumes: 0,
      voices: [],
      events,
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: class {
        text: string
        constructor(text: string) {
          this.text = text
        }
      },
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => probe.voices,
        speak: (utterance: SpeechSynthesisUtterance) => {
          probe.spoken.push(utterance)
          utterance.onstart?.(new Event('start') as SpeechSynthesisEvent)
        },
        cancel: () => probe.cancels++,
        pause: () => probe.pauses++,
        resume: () => probe.resumes++,
        addEventListener: events.addEventListener.bind(events),
        removeEventListener: events.removeEventListener.bind(events),
      },
    })
  })
})

test('all six complete manuscripts have the mapped lazy video, accessible controls, and responsive formulas', async ({
  page,
}, info) => {
  await page.goto('/')
  for (const [id, lesson] of Object.entries(lessons)) {
    await page.getByRole('button', { name: 'Explore Lessons' }).click()
    await page
      .getByRole('button', { name: lesson.title, exact: false })
      .first()
      .click()
    await expect(
      page.getByRole('heading', { name: lesson.title, exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Tujuan belajar', exact: true }),
    ).toHaveCount(0)
    await expect(
      page.getByText(
        /Tekan Dengarkan materi untuk memulai|Suara otomatis dari perangkat|Suara bahasa Indonesia belum tersedia/,
      ),
    ).toHaveCount(0)
    const audio = page.locator('.lesson-audio')
    expect(
      await audio
        .locator('h2')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBe(16)
    for (const control of await audio.locator('button,label,select').all()) {
      const size = await control.evaluate((el) =>
        parseFloat(getComputedStyle(el).fontSize),
      )
      expect(size).toBeGreaterThanOrEqual(13)
      expect(size).toBeLessThanOrEqual(14)
    }
    expect(await page.locator('.lesson-manuscript p').count()).toBeGreaterThan(
      5,
    )
    await expect(page.locator('.lesson-manuscript')).toContainText(
      lesson.blocks[0].text,
    )
    await expect(page.locator('.lesson-manuscript')).toContainText(
      lesson.blocks.at(-1)!.text,
    )
    await expect(page.locator('.lesson-video-frame iframe')).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Tonton di YouTube' }),
    ).toHaveAttribute(
      'href',
      `https://www.youtube.com/watch?v=${lesson.videoId}`,
    )
    {
      for (const width of [1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 })
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          )
          .toBe(true)
        for (const button of await audio.locator('button').all())
          expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(
            44,
          )
        if (id === '1' && [1440, 390].includes(width))
          await audio.screenshot({
            path: `tmp/compact-lesson-audio-${info.project.name}-${width}.png`,
          })
        await page
          .getByRole('button', { name: `Putar video ${lesson.title}` })
          .scrollIntoViewIfNeeded()
        await expect(
          page.getByRole('button', { name: `Putar video ${lesson.title}` }),
        ).toBeInViewport()
      }
    }
    await page
      .getByRole('button', { name: `Putar video ${lesson.title}` })
      .click()
    await expect(page.locator('.lesson-video-frame iframe')).toHaveAttribute(
      'src',
      new RegExp(`/embed/${lesson.videoId}`),
    )
    await expect(page.locator('.lesson-video-frame iframe')).toHaveAttribute(
      'title',
      `Video pembelajaran ${lesson.title}`,
    )
    await expect(page.locator('.lesson-video-frame iframe')).toHaveAttribute(
      'allowfullscreen',
      '',
    )
    await page
      .getByRole('button', { name: 'Kembali ke Listrik Dinamis' })
      .click()
    await expect(page.locator('.lesson-video-frame iframe')).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Explore Lessons' }).click()
  await expect(
    page.getByRole('button', { name: 'Download E-book' }),
  ).toBeDisabled()
  await expect(page.getByText('E-book belum tersedia.')).toBeVisible()
  await expect(page.locator('.lesson-resources a')).toHaveCount(10)
  await page
    .getByRole('button', { name: 'Arus Listrik', exact: false })
    .first()
    .click()
  await page.setViewportSize({ width: 1024, height: 900 })
  await page.screenshot({
    path: `tmp/lesson-arus-${info.project.name}.png`,
    fullPage: true,
    animations: 'disabled',
  })
})

test('speech is opt-in, handles late Indonesian voices, pause/resume, formulas, video errors, and cleanup', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore Lessons' }).click()
  await page
    .getByRole('button', { name: 'Arus Listrik', exact: false })
    .first()
    .click()
  expect(
    await page.evaluate(() => window.lessonSpeechProbe.spoken.length),
  ).toBe(0)
  await page.evaluate(() => {
    window.lessonSpeechProbe.voices = [
      { lang: 'id-ID', name: 'Test Indonesian' } as SpeechSynthesisVoice,
    ]
    window.lessonSpeechProbe.events.dispatchEvent(new Event('voiceschanged'))
  })
  await page.getByLabel('Kecepatan baca').selectOption('1.5')
  await page
    .getByRole('button', { name: 'Dengarkan materi', exact: true })
    .click()
  expect(
    await page.evaluate(() => ({
      text: window.lessonSpeechProbe.spoken[0].text,
      lang: window.lessonSpeechProbe.spoken[0].lang,
      rate: window.lessonSpeechProbe.spoken[0].rate,
      voice: window.lessonSpeechProbe.spoken[0].voice?.lang,
    })),
  ).toEqual({ text: 'Arus Listrik', lang: 'id-ID', rate: 1.5, voice: 'id-ID' })
  await page.getByRole('button', { name: 'Jeda', exact: true }).click()
  expect(await page.evaluate(() => window.lessonSpeechProbe.pauses)).toBe(1)
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click()
  expect(await page.evaluate(() => window.lessonSpeechProbe.resumes)).toBe(1)
  await page.evaluate(() => {
    // Advance every speech chunk just as the browser's speech engine does.
    for (
      let index = 0;
      index < window.lessonSpeechProbe.spoken.length && index < 200;
      index++
    ) {
      const chunk = window.lessonSpeechProbe.spoken[index]
      chunk.onend?.(new Event('end') as SpeechSynthesisEvent)
    }
  })
  await expect(page.getByText('Pembacaan materi selesai.')).toBeVisible()
  expect(
    await page.evaluate(() =>
      window.lessonSpeechProbe.spoken.some(
        (chunk) => chunk.text === 'I sama dengan Q dibagi t.',
      ),
    ),
  ).toBe(true)
  await page
    .getByRole('button', { name: 'Dengarkan materi', exact: true })
    .click()
  await page.getByRole('button', { name: 'Hentikan', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Hentikan', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'Dengarkan materi', exact: true })
    .click()
  await page.getByRole('button', { name: 'Putar video Arus Listrik' }).click()
  await expect(
    page.getByRole('button', { name: 'Hentikan', exact: true }),
  ).toBeDisabled()
  await expect
    .poll(() => page.evaluate(() => typeof window.lessonVideoError))
    .toBe('function')
  await page.evaluate(() => window.lessonVideoError!({ data: 150 }))
  await expect(page.locator('.lesson-video-message')).toContainText(
    'pemiliknya membatasi penyematan',
  )
  await expect(
    page.getByRole('link', { name: 'Tonton di YouTube' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Dengarkan materi', exact: true })
    .click()
  await expect(page.locator('.lesson-video-frame iframe')).toHaveCount(0)
  const cancels = await page.evaluate(() => window.lessonSpeechProbe.cancels)
  await page
    .getByRole('button', { name: 'Lanjut ke materi berikutnya', exact: true })
    .click()
  expect(
    await page.evaluate(() => window.lessonSpeechProbe.cancels),
  ).toBeGreaterThan(cancels)
  await expect(
    page.getByRole('heading', {
      name: 'Hambatan Ohmik dan Non-Ohmik',
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Hentikan', exact: true }),
  ).toBeDisabled()
})

test('speed changes while reading and paused preserve position and ignore canceled callbacks', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Explore Lessons', exact: true })
    .click()
  await page.getByRole('button', { name: 'Arus Listrik', exact: true }).click()
  await page
    .getByRole('button', { name: 'Dengarkan materi', exact: true })
    .click()
  await page.evaluate(() =>
    window.lessonSpeechProbe.spoken[0].onend?.(
      new Event('end') as SpeechSynthesisEvent,
    ),
  )
  const text = await page.evaluate(
    () => window.lessonSpeechProbe.spoken.at(-1)!.text,
  )
  await page.getByLabel('Kecepatan baca').selectOption('1.5')
  expect(
    await page.evaluate(() => ({
      text: window.lessonSpeechProbe.spoken.at(-1)!.text,
      rate: window.lessonSpeechProbe.spoken.at(-1)!.rate,
    })),
  ).toEqual({ text, rate: 1.5 })
  await expect(page.locator('.lesson-audio-status')).toHaveCount(0)
  await page.getByRole('button', { name: 'Jeda', exact: true }).click()
  const count = await page.evaluate(
    () => window.lessonSpeechProbe.spoken.length,
  )
  await page.getByLabel('Kecepatan baca').selectOption('0.8')
  expect(
    await page.evaluate(() => window.lessonSpeechProbe.spoken.length),
  ).toBe(count)
  await expect(
    page.getByRole('button', { name: 'Lanjutkan', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.lesson-audio-status')).toHaveCount(0)
  await page.evaluate(() =>
    window.lessonSpeechProbe.spoken
      .at(-1)!
      .onend?.(new Event('end') as SpeechSynthesisEvent),
  )
  expect(
    await page.evaluate(() => window.lessonSpeechProbe.spoken.length),
  ).toBe(count)
  await page.getByRole('button', { name: 'Lanjutkan', exact: true }).click()
  expect(
    await page.evaluate(() => ({
      text: window.lessonSpeechProbe.spoken.at(-1)!.text,
      rate: window.lessonSpeechProbe.spoken.at(-1)!.rate,
    })),
  ).toEqual({ text, rate: 0.8 })
  await page.getByRole('button', { name: 'Hentikan', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Dengarkan materi', exact: true }),
  ).toBeVisible()
})

test('unsupported speech does not block text, video, or formative access', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    }),
  )
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore Lessons' }).click()
  await page
    .getByRole('button', { name: 'Arus Listrik', exact: false })
    .first()
    .click()
  await expect(
    page.getByText('Browser ini belum mendukung pembacaan suara.', {
      exact: false,
    }),
  ).toBeVisible()
  await expect(page.locator('.lesson-manuscript')).toContainText('Baterai buah')
  await page.getByRole('button', { name: 'Putar video Arus Listrik' }).click()
  await expect(page.locator('.lesson-video-frame iframe')).toBeVisible()
  await page
    .getByRole('button', { name: 'Lanjut ke materi berikutnya', exact: true })
    .click()
  await expect(
    page.getByRole('heading', {
      name: 'Hambatan Ohmik dan Non-Ohmik',
      exact: true,
    }),
  ).toBeVisible()
})

test('speech queues immediately without waiting for voices and reports actual start', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Explore Lessons', exact: true })
    .click()
  await page.getByRole('button', { name: 'Arus Listrik', exact: true }).click()
  await expect(page.getByLabel('Kecepatan baca').locator('option')).toHaveText([
    '0,8×',
    '1×',
    '1,5×',
    '2×',
  ])
  const before = await page.evaluate(() => {
    window.lessonSpeechProbe.voices = []
    let clickedAt = 0
    document.addEventListener(
      'click',
      () => {
        clickedAt = performance.now()
      },
      { once: true, capture: true },
    )
    window.speechSynthesis.speak = (u: SpeechSynthesisUtterance) => {
      window.lessonSpeechProbe.spoken.push(u)
      ;(window as unknown as { audioQueueMs: number }).audioQueueMs =
        performance.now() - clickedAt
    }
    return window.lessonSpeechProbe.cancels
  })
  await page
    .getByRole('button', { name: 'Dengarkan materi', exact: true })
    .click()
  expect(
    await page.evaluate(() => window.lessonSpeechProbe.spoken.length),
  ).toBe(1)
  expect(await page.evaluate(() => window.lessonSpeechProbe.cancels)).toBe(
    before,
  )
  const queueMs = await page.evaluate(
    () => (window as unknown as { audioQueueMs: number }).audioQueueMs,
  )
  expect(queueMs).toBeLessThan(100)
  console.log(`Audio click-to-queue (mock engine): ${queueMs.toFixed(1)} ms`)
  await expect(page.locator('.lesson-audio-status')).toContainText(
    'Menyiapkan audio',
  )
  await page.evaluate(() =>
    window.lessonSpeechProbe.spoken[0].onstart?.(
      new Event('start') as SpeechSynthesisEvent,
    ),
  )
  await expect(
    page.getByRole('button', { name: 'Jeda', exact: true }),
  ).toBeVisible()
  await page.getByLabel('Kecepatan baca').selectOption('2')
  expect(
    await page.evaluate(() => window.lessonSpeechProbe.spoken.at(-1)?.rate),
  ).toBe(2)
})
