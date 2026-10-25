import { expect, type Page } from '@playwright/test'
import { fillObservations } from './observations'
export async function prepareMission(page: Page) {
  await page.getByRole('radio', { name: 'Prediksi lain', exact: true }).check()
  await expect(page.getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })).toBeDisabled()
  await page.locator('#prediction-text').fill('Saya menduga perubahan susunan rangkaian memengaruhi keadaan lampu.')
  await page.locator('#prediction-reason').fill('Saya ingin menguji hubungan komponen dan arus melalui pengamatan.')
  await page
    .getByRole('button', { name: 'Lanjut ke eksperimen', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Lanjut ke pengamatan', exact: true })
    .click()
  await fillObservations(page)
  await page.locator('#reflection-reason').fill('Saya membandingkan hasil pengamatan dengan konsep dan rumus pada materi.')
  await expect(
    page.getByRole('button', { name: 'Periksa pilihan', exact: true }),
  ).toBeVisible()
}
