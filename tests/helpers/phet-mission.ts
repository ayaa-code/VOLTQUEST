import { expect, type Page } from '@playwright/test'
import { fillObservations } from './observations'
export async function prepareMission(page: Page) {
  await page.getByRole('radio', { name: 'Belum yakin', exact: true }).check()
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await fillObservations(page)
  await expect(
    page.getByRole('button', { name: 'Kirim jawaban', exact: true }),
  ).toBeVisible()
}
