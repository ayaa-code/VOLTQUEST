import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const phase = process.argv[2]
if (!['before', 'after', 'guided', 'practice', 'concept'].includes(phase))
  throw new Error(
    'Gunakan: node scripts/audit-ui.mjs before|after|guided|practice|concept',
  )
const output =
  phase === 'concept'
    ? path.resolve('artifacts/concept-feedback/readability')
    : phase === 'practice'
      ? path.resolve('artifacts/practice-recommendations/readability')
      : phase === 'guided'
        ? path.resolve('artifacts/guided-experiment/readability')
        : path.resolve('artifacts/ui-readability', phase)
if (
  phase === 'before' &&
  (await fs.access(path.join(output, 'measurements.json')).then(
    () => true,
    () => false,
  ))
) {
  throw new Error(
    'Bukti before sudah tersimpan dan tidak akan ditimpa. Gunakan mode after untuk pemeriksaan ulang.',
  )
}
await fs.mkdir(output, { recursive: true })
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
})
const measurements = []
const interactions = []
const baselineCss = new Map()
if (phase === 'before') {
  for (const name of ['index.css', 'App.css']) {
    const saved = path.resolve('artifacts/ui-readability/before', name)
    let css
    try {
      css = await fs.readFile(saved, 'utf8')
    } catch {
      css = await fs.readFile(path.resolve('src', name), 'utf8')
      await fs.writeFile(saved, css)
    }
    baselineCss.set(name, css)
  }
}

async function completeTable(page) {
  for (const select of await page.locator('.observation-form select').all())
    await select.selectOption({ index: 1 })
  for (const input of await page.locator('.observation-form input').all())
    await input.fill('6')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
}

function measure() {
  const rgba = (value) => {
    const values = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]
    return [...values.slice(0, 3), values[3] ?? 1]
  }
  const blend = (front, back) => {
    const alpha = front[3] + back[3] * (1 - front[3])
    return [
      ...front
        .slice(0, 3)
        .map((n, i) =>
          alpha
            ? (n * front[3] + back[i] * back[3] * (1 - front[3])) / alpha
            : 0,
        ),
      alpha,
    ]
  }
  const luminance = (color) =>
    color
      .slice(0, 3)
      .map((n) => n / 255)
      .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0)
  const contrast = (a, b) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) /
    (Math.min(luminance(a), luminance(b)) + 0.05)
  const visible = (el) =>
    el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
    el.getClientRects().length > 0
  const colors = (el) => {
    let bg = [0, 0, 0, 0],
      fg = rgba(getComputedStyle(el).color),
      opacity = 1,
      gradient = false
    for (let e = el; e; e = e.parentElement) {
      const style = getComputedStyle(e)
      if (bg[3] < 0.999 && style.backgroundImage !== 'none') gradient = true
      bg = blend(bg, rgba(style.backgroundColor))
      fg = blend(fg, rgba(style.backgroundColor))
      bg[3] *= Number(style.opacity)
      fg[3] *= Number(style.opacity)
      opacity *= Number(style.opacity)
    }
    return {
      fg: blend(fg, [255, 255, 255, 1]),
      bg: blend(bg, [255, 255, 255, 1]),
      opacity,
      gradient,
    }
  }
  const selector = (el) =>
    el.tagName.toLowerCase() +
    (el.classList.length ? '.' + [...el.classList].join('.') : '')
  const root = document.querySelector('dialog[open]') || document.body
  const texts = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode
    const el = node.parentElement
    const text = node.textContent.trim()
    if (!text || !el || !visible(el) || el.closest('svg,script,style')) continue
    const cs = getComputedStyle(el)
    const color = colors(el)
    const size = parseFloat(cs.fontSize)
    const decorative = Boolean(
      el.closest('.wave,.title-spark,.tip-spark,.tiny-dot'),
    )
    const disabled = Boolean(el.closest(':disabled'))
    const threshold =
      size >= 24 || (size >= 18.667 && Number(cs.fontWeight) >= 700) ? 3 : 4.5
    const ratio = contrast(color.fg, color.bg)
    texts.push({
      selector: selector(el),
      text: text.slice(0, 100),
      fontSize: size,
      lineHeight: cs.lineHeight,
      color: cs.color,
      background: color.bg.slice(0, 3),
      ratio,
      threshold,
      disabled,
      decorative,
      gradient: color.gradient,
      opacity: color.opacity,
      pass: disabled || decorative || color.gradient || ratio >= threshold,
    })
  }
  const controls = [
    ...root.querySelectorAll(
      'button,a,input,select,textarea,label.answer-option',
    ),
  ]
    .filter(visible)
    .map((el) => {
      const rect = el.getBoundingClientRect(),
        cs = getComputedStyle(el)
      const inlineLink = Boolean(el.matches('.about-content a'))
      const color = colors(el)
      return {
        selector: selector(el),
        name:
          el.getAttribute('aria-label') ||
          el.textContent.trim().slice(0, 70) ||
          el.getAttribute('placeholder'),
        width: rect.width,
        height: rect.height,
        disabled: el.matches(':disabled'),
        inlineLink,
        focusVisible: el.matches(':focus-visible'),
        outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
        borderColor: cs.borderTopColor,
        borderContrast: contrast(rgba(cs.borderTopColor), color.bg),
      }
    })
  const placeholders = [...root.querySelectorAll('input[placeholder]')]
    .filter(visible)
    .map((el) => {
      const cs = getComputedStyle(el, '::placeholder'),
        bg = colors(el).bg
      const ink = rgba(cs.color)
      ink[3] *= Number(cs.opacity)
      return {
        selector: selector(el),
        color: cs.color,
        ratio: contrast(blend(ink, bg), bg),
      }
    })
  const clipped = [...root.querySelectorAll('*')]
    .filter((el) => {
      if (
        !visible(el) ||
        el.closest('svg') ||
        !el.textContent.trim() ||
        !['hidden', 'clip'].includes(getComputedStyle(el).overflowX)
      )
        return false
      const bounds = el.getBoundingClientRect()
      const textWalker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      while (textWalker.nextNode()) {
        const node = textWalker.currentNode
        if (
          !node.textContent.trim() ||
          !visible(node.parentElement) ||
          node.parentElement.closest('svg')
        )
          continue
        const range = document.createRange()
        range.selectNodeContents(node)
        if (
          [...range.getClientRects()].some(
            (rect) =>
              rect.left < bounds.left - 2 || rect.right > bounds.right + 2,
          )
        )
          return true
      }
      return false
    })
    .map((el) => selector(el))
  return {
    viewport: { width: innerWidth, height: innerHeight },
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    texts,
    controls,
    placeholders,
    clipped,
  }
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    // Re-measure the frozen original styles without changing the running app.
    for (const [name, css] of baselineCss) {
      await page.route(`**/src/${name}*`, (route) =>
        route.fulfill({
          contentType: 'application/javascript',
          body: `const style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.appendChild(style);`,
        }),
      )
    }
    page.setDefaultTimeout(10000)
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Masuk atau Daftar' }).waitFor()
    await page.evaluate(() =>
      Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]),
    )
    async function snapshot(state) {
      const metrics = await page.evaluate(measure)
      measurements.push({ state, width, ...metrics })
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: path.join(output, `${width}-${state}.png`),
          fullPage: true,
          animations: 'disabled',
        })
    }
    await snapshot('onboarding')
    await page.getByRole('button', { name: 'Masuk atau Daftar' }).hover()
    await snapshot('onboarding-hover')
    await page.keyboard.press('Tab')
    await snapshot('onboarding-focus')
    await page.getByRole('button', { name: /Sudah punya kelas/ }).click()
    await page.getByLabel('Kode dari guru').fill('FISIKA-01')
    await page.getByRole('button', { name: 'Periksa kode' }).click()
    await snapshot('class-dialog')
    await page.getByRole('button', { name: 'Tutup', exact: true }).click()
    await page.getByRole('button', { name: 'Masuk atau Daftar' }).click()
    await page.getByLabel('Siapa nama panggilanmu?').fill('Nara')
    await snapshot('login')
    await page.getByRole('button', { name: 'Masuk', exact: true }).click()
    await snapshot('dashboard')
    if (phase === 'practice' || phase === 'concept') {
      await page.getByRole('button', { name: 'Buka latihan mandiri' }).click()
      await snapshot('practice-focus')
      await page
        .getByRole('button', {
          name: 'Latih Hubungan V, I, dan R',
          exact: true,
        })
        .click()
      await snapshot('practice-question')
      await page.getByRole('radio', { name: 'A 27 Ω', exact: true }).focus()
      await page.keyboard.press('Space')
      await snapshot('practice-keyboard-selection')
      await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
      await snapshot('practice-wrong-feedback')
      await page.getByRole('radio', { name: 'D 3 Ω', exact: true }).check()
      await page.getByRole('button', { name: 'Kirim jawaban latihan' }).click()
      await snapshot('practice-correct-feedback')
      await page.getByRole('button', { name: 'Ulangi latihan ini' }).click()
      await snapshot('practice-repeat')
      await page.getByRole('button', { name: 'Coba latihan lain' }).click()
      await snapshot('practice-next-exercise')
      await page.getByRole('button', { name: 'Ke dashboard misi' }).click()
    }
    await page.getByLabel('Cari misi').fill('Ohm')
    await snapshot('search')
    await page.getByLabel('Hapus pencarian').click()
    await page.getByRole('button', { name: 'Selesai', exact: true }).click()
    await snapshot('empty-filter')
    await page.getByRole('button', { name: 'Tampilkan semua misi' }).click()
    await page.getByRole('button', { name: 'Mulai misi pertama' }).click()
    await snapshot('mission')
    if (await page.locator('.experiment-steps').count()) {
      await page
        .getByRole('radio', { name: 'Belum yakin', exact: true })
        .check()
      await page
        .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
        .click()
      await snapshot('guided-experiment')
      await page
        .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
        .click()
      await snapshot('guided-observation')
      await page
        .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
        .click()
      await snapshot('guided-observation-validation')
      await completeTable(page)
      await snapshot('guided-reflection-recorded')
    }
    await page.getByRole('radio', { name: 'A Kabel', exact: true }).focus()
    await page.keyboard.press('Space')
    await page.keyboard.press('ArrowDown')
    const keyboardRadio = await page
      .getByRole('radio', { name: 'B Baterai', exact: true })
      .isChecked()
    await page.keyboard.press('ArrowUp')
    const radioFocus = await page
      .locator('.answer-option:has(input:focus-visible)')
      .evaluate((el) => ({
        outlineWidth: getComputedStyle(el).outlineWidth,
        outlineColor: getComputedStyle(el).outlineColor,
      }))
    await snapshot('answer-selected')
    await page.getByRole('button', { name: 'Kirim jawaban' }).click()
    await snapshot('feedback-wrong')
    if (phase === 'concept') {
      await page
        .locator('input[name="confirmation"][value="battery-source"]')
        .focus()
      await page.keyboard.press('Space')
      await page
        .getByRole('button', { name: 'Lihat bantuan dari alasan' })
        .click()
      await snapshot('confirmation-not-supported')
      await page
        .locator('input[name="confirmation"][value="wire-source"]')
        .check()
      await page
        .getByRole('button', { name: 'Lihat bantuan dari alasan' })
        .click()
      await snapshot('confirmation-supported')
      await page.locator('input[name="confirmation"][value="unsure"]').check()
      await page
        .getByRole('button', { name: 'Lihat bantuan dari alasan' })
        .click()
      await snapshot('confirmation-unsure')
      await page
        .getByRole('button', { name: 'Coba latihan yang ditawarkan' })
        .click()
      await snapshot('confirmation-recommended-practice')
      await page
        .getByRole('button', { name: 'Kembali ke refleksi', exact: true })
        .first()
        .click()
    }
    await page.getByRole('radio', { name: 'B Baterai', exact: true }).check()
    await page.getByRole('button', { name: 'Kirim jawaban' }).click()
    await snapshot('feedback-correct')
    await page.getByRole('button', { name: 'Kembali ke misi' }).click()
    if (phase === 'guided') {
      for (const id of [2, 3, 4, 5]) {
        await page
          .locator('.mission-card')
          .nth(id - 1)
          .click()
        await page
          .getByRole('radio', { name: 'Belum yakin', exact: true })
          .check()
        await page
          .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
          .click()
        await snapshot(`guided-m${id}-experiment`)
        await page
          .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
          .click()
        await snapshot(`guided-m${id}-observation`)
        await page
          .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
          .click()
        await snapshot(`guided-m${id}-validation`)
        await page
          .getByRole('button', { name: 'Kembali ke misi', exact: true })
          .click()
      }
    }
    if (phase === 'concept') {
      const responses = [
        'single-path-enough',
        'multiply',
        'power-reversed',
        'series-independent',
      ]
      for (const id of [2, 3, 4, 5]) {
        await page
          .locator('.mission-card')
          .nth(id - 1)
          .click()
        await page
          .getByRole('radio', { name: 'Belum yakin', exact: true })
          .check()
        await page
          .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
          .click()
        await page
          .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
          .click()
        await completeTable(page)
        await page.locator('input[name="answer"]').first().check()
        await page
          .getByRole('button', { name: 'Kirim jawaban', exact: true })
          .click()
        await snapshot(`confirmation-m${id}-question`)
        await page
          .locator(`input[name="confirmation"][value="${responses[id - 2]}"]`)
          .check()
        await page
          .getByRole('button', { name: 'Lihat bantuan dari alasan' })
          .click()
        await snapshot(`confirmation-m${id}-feedback`)
        await page
          .getByRole('button', { name: 'Coba latihan yang ditawarkan' })
          .click()
        await snapshot(`confirmation-m${id}-practice`)
        await page.getByRole('button', { name: 'Ke dashboard misi' }).click()
      }
    }
    await page
      .getByRole('button', { name: /Badge saya/i })
      .filter({ visible: true })
      .click()
    await snapshot('badges-dialog')
    await page.locator('dialog button').last().focus()
    await page.keyboard.press('Tab')
    const focusInDialog = await page.evaluate(() =>
      document.querySelector('dialog')?.contains(document.activeElement),
    )
    const focusWrappedForward = await page
      .getByLabel('Tutup', { exact: true })
      .evaluate((el) => el === document.activeElement)
    await page.keyboard.press('Shift+Tab')
    const focusWrappedBackward = await page
      .locator('dialog button')
      .last()
      .evaluate((el) => el === document.activeElement)
    await page.keyboard.press('Escape')
    const focusRestored = await page.evaluate(() =>
      document.activeElement?.textContent.includes('Badge'),
    )
    const progress =
      width <= 700
        ? page.locator('.mobile-nav').getByRole('button', { name: 'Progres' })
        : page.getByLabel('Lihat detail progres')
    await progress.click()
    await snapshot('progress-dialog')
    await page.keyboard.press('Escape')
    await page.getByLabel('Buka profil siswa').click()
    await snapshot('profile-dialog')
    await page.keyboard.press('Escape')
    await page
      .getByRole('button', { name: 'Tentang VoltQuest' })
      .scrollIntoViewIfNeeded()
    const footerControlClear = await page
      .getByRole('button', { name: 'Tentang VoltQuest' })
      .evaluate((el) => {
        const nav = document.querySelector('.mobile-nav')
        return (
          getComputedStyle(nav).display === 'none' ||
          el.getBoundingClientRect().bottom <= nav.getBoundingClientRect().top
        )
      })
    await page.getByRole('button', { name: 'Tentang VoltQuest' }).click()
    await snapshot('about-dialog')
    await page.locator('dialog').evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    const closeVisibleAfterScroll = await page
      .getByLabel('Tutup', { exact: true })
      .evaluate((el) => {
        const button = el.getBoundingClientRect(),
          dialog = el.closest('dialog').getBoundingClientRect()
        return button.top >= dialog.top && button.bottom <= dialog.bottom
      })
    if (phase === 'after') {
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: path.join(
            output,
            `${width}-about-dialog-scrolled-viewport.png`,
          ),
          animations: 'disabled',
        })
      await page.getByLabel('Tutup', { exact: true }).click()
    } else await page.keyboard.press('Escape')
    await page.getByLabel('Buka profil siswa').click()
    await page.getByRole('button', { name: 'Keluar dari profil' }).click()
    await page
      .getByLabel('Siapa nama panggilanmu?')
      .fill('Penjelajah Dengan Nama Panjang Sekali')
    await page.getByRole('button', { name: 'Masuk', exact: true }).click()
    await snapshot('dashboard-long-name')
    // Text-only enlargement at an unchanged viewport, not browser zoom.
    const textResize = await page.evaluate(() => {
      const sizes = [...document.querySelectorAll('*')]
        .filter((el) => !el.closest('svg'))
        .map((el) => [el, parseFloat(getComputedStyle(el).fontSize)])
      for (const [el, size] of sizes)
        el.style.setProperty('font-size', `${size * 2}px`, 'important')
      return {
        method: 'text-only enlargement 200%; viewport unchanged',
        width: innerWidth,
      }
    })
    await snapshot('text-200-dashboard')
    interactions.push({
      width,
      keyboardRadio,
      radioFocus,
      focusInDialog,
      focusWrappedForward,
      focusWrappedBackward,
      focusRestored,
      footerControlClear,
      closeVisibleAfterScroll,
      textResize,
    })
    await context.close()
    console.log(`${phase}: ${width}px complete`)
  }
} finally {
  await browser.close()
  const failures = measurements.flatMap((m) =>
    m.texts
      .filter((t) => !t.pass)
      .map((t) => ({ state: m.state, width: m.width, ...t })),
  )
  const smallTargets = measurements.flatMap((m) =>
    m.controls
      .filter(
        (c) =>
          !c.disabled && !c.inlineLink && (c.width < 43.9 || c.height < 43.9),
      )
      .map((c) => ({ state: m.state, width: m.width, ...c })),
  )
  const summary = {
    phase,
    samples: measurements.length,
    contrastFailures: failures.length,
    smallTargets: smallTargets.length,
    horizontalOverflow: measurements
      .filter((m) => m.horizontalOverflow)
      .map((m) => ({ width: m.width, state: m.state })),
    clipped: measurements
      .filter((m) => m.clipped.length)
      .map((m) => ({ width: m.width, state: m.state, elements: m.clipped })),
    interactions,
  }
  summary.placeholderFailures = measurements
    .flatMap((m) => m.placeholders)
    .filter((p) => p.ratio < 4.5).length
  summary.interactionFailures = interactions
    .filter(
      (i) =>
        !i.keyboardRadio ||
        !i.focusInDialog ||
        !i.focusWrappedForward ||
        !i.focusWrappedBackward ||
        !i.focusRestored ||
        !i.footerControlClear ||
        !i.closeVisibleAfterScroll,
    )
    .map((i) => i.width)
  await fs.writeFile(
    path.join(output, 'measurements.json'),
    JSON.stringify({ summary, measurements, failures, smallTargets }, null, 2),
  )
  console.log(JSON.stringify(summary))
  if (
    phase !== 'before' &&
    (summary.contrastFailures ||
      summary.smallTargets ||
      summary.horizontalOverflow.length ||
      summary.clipped.length ||
      summary.placeholderFailures ||
      summary.interactionFailures.length)
  )
    process.exitCode = 1
}
