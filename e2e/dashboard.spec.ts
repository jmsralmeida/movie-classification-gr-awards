import { expect, test } from '@playwright/test'
import { mockDashboardApi } from './support/mockApi.ts'

test('year search: URL, reload and back restore the table (router + history + query)', async ({
  page,
}) => {
  await mockDashboardApi(page)
  await page.goto('/dashboard')

  const field = page.getByRole('textbox', { name: 'Search by year' })
  const table = page.getByRole('table', { name: 'Winners of the selected year' })

  await field.fill('2018')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(table.getByRole('cell', { name: 'Holmes & Watson' })).toBeVisible()
  await expect(page).toHaveURL(/\?year=2018$/)

  await page.reload()
  await expect(field).toHaveValue('2018')
  await expect(table.getByRole('cell', { name: 'Holmes & Watson' })).toBeVisible()

  await field.fill('1990')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/\?year=1990$/)
  await expect(table.getByRole('cell', { name: 'The Adventures of Ford Fairlane' })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\?year=2018$/)
  await expect(field).toHaveValue('2018')
  await expect(table.getByRole('cell', { name: 'Holmes & Watson' })).toBeVisible()

  await page.goto('/dashboard?year=2018')
  await expect(field).toHaveValue('2018')
  await expect(table.getByRole('cell', { name: 'Holmes & Watson' })).toBeVisible()
})
