import { expect, type Page } from '@playwright/test'
export async function playToGate(page: Page) {
  if (await page.locator('.cq-options-list').isVisible()) return
  const canvas = page.locator('.cq-canvas')
  await canvas.waitFor()
  const state = () =>
    canvas.evaluate((el) => ({
      x: Number((el as HTMLElement).dataset.playerX),
      y: Number((el as HTMLElement).dataset.playerY),
      grounded: (el as HTMLElement).dataset.grounded === 'true',
    }))
  async function move(target: number, jump = false) {
    const p = await state()
    const key = p.x < target ? 'ArrowRight' : 'ArrowLeft'
    if (jump) await page.keyboard.down('ArrowUp')
    await page.keyboard.down(key)
    await expect
      .poll(
        async () => {
          const q = await state()
          return key === 'ArrowRight' ? q.x >= target : q.x <= target
        },
        { timeout: 8000, intervals: [15] },
      )
      .toBeTruthy()
    await page.keyboard.up(key)
    await page.keyboard.up('ArrowUp')
    await page.waitForTimeout(100)
  }
  await expect
    .poll(async () => (await state()).grounded, { timeout: 4000 })
    .toBeTruthy()
  const mission = await page.locator('.cq-topbar-left').innerText()
  await move(110)
  await move(212, true)
  await expect
    .poll(async () => (await state()).grounded, { timeout: 4000 })
    .toBeTruthy()
  await move(264)
  await move(434, true)
  await expect
    .poll(async () => (await state()).grounded, { timeout: 4000 })
    .toBeTruthy()
  if (mission.includes('Pemindai')) {
    await move(480)
    await move(650)
  } else await move(650)
  await page.waitForTimeout(150)
  await move(744)
  await expect(page.locator('.cq-options-list')).toBeVisible({ timeout: 4000 })
}
export async function finishCurrentGame(page: Page) {
  for (const [index, key] of ['B', 'D', 'D'].entries()) {
    await playToGate(page)
    await page
      .locator('.cq-option-btn')
      .filter({
        has: page.locator('.cq-option-key', {
          hasText: new RegExp(`^${key}$`),
        }),
      })
      .click()
    await page
      .getByRole('button', {
        name:
          index < 2 ? 'Lanjut ke Misi Berikutnya' : 'Selesaikan Pengisian Accu',
        exact: true,
      })
      .click()
  }
}
