import { type Page } from '@playwright/test'
export async function finishCurrentGame(page: Page) {
  await page.locator('.cq-container').waitFor()
  for (const [index, key] of ['B', 'D', 'D'].entries()) {
    const mode = page.getByRole('button', { name: 'Mode soal tanpa gerak' })
    if (await mode.count()) await mode.click()
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
