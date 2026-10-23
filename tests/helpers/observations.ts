import type { Page } from '@playwright/test'
import { experiments } from '../../src/data/experiments'

// Test fixtures only; these values are never inserted into student drafts by the app.
export function observationFixture(id: number) {
  return Object.fromEntries(
    experiments[id].groups
      .flatMap((group) => group.fields)
      .map((field) => [field.id, field.choices?.[0] ?? '6']),
  )
}
export async function fillObservations(page: Page) {
  for (const select of await page.locator('.observation-form select').all())
    await select.selectOption({ index: 1 })
  for (const input of await page.locator('.observation-form input').all())
    await input.fill('6')
  await page
    .getByRole('button', { name: 'Simpan pengamatan dan lanjut' })
    .click()
}
