import { expect, test } from '@playwright/test'
import { mockListApi } from './support/mockApi.ts'

test('list request: year and winner filters reach the API as query params (UI + http client + query key)', async ({
  page,
}) => {
  await mockListApi(page)
  const apiUrls: string[] = []
  page.on('request', (request) => {
    if (/\/api\/movies(\?|$)/.test(request.url())) apiUrls.push(request.url())
  })

  await page.goto('/list')
  await page.getByRole('textbox', { name: 'Filter by year' }).fill('1981')
  await page.getByRole('combobox', { name: 'Filter by winner' }).selectOption('Yes')

  await expect
    .poll(() => {
      const last = apiUrls.at(-1)
      return last === undefined ? '' : new URL(last).searchParams.toString()
    })
    .toBe('page=0&size=15&year=1981&winner=true')
  await expect(page.getByRole('cell', { name: 'Mommie Dearest' })).toBeVisible()
})

test('list URL: filters and page survive reload and back (router + history + query)', async ({
  page,
}) => {
  await mockListApi(page)
  const yearField = page.getByRole('textbox', { name: 'Filter by year' })
  const winnerSelect = page.getByRole('combobox', { name: 'Filter by winner' })
  const page2 = page.getByRole('button', { name: 'Page 2' })
  // Os não vencedores são os ids 2 a 10, 12 a 30 e 32 a 40: a página 2 começa no id 18.
  const firstOfPage2 = page.getByRole('cell', { name: 'Movie 18', exact: true })

  await page.goto('/list')
  await winnerSelect.selectOption('No')
  await page.getByRole('button', { name: 'Next page' }).click()

  await expect(page).toHaveURL(/page=2/)
  await expect(page).toHaveURL(/winner=false/)
  await expect(firstOfPage2).toBeVisible()

  await page.reload()
  await expect(yearField).toHaveValue('')
  await expect(winnerSelect).toHaveValue('false')
  await expect(page2).toHaveAttribute('aria-current', 'page')
  await expect(firstOfPage2).toBeVisible()

  await yearField.fill('1981')
  await expect(page).toHaveURL(/year=1981/)
  expect(page.url()).not.toContain('page=')

  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  await expect(yearField).toHaveValue('')
  await expect(page2).toHaveAttribute('aria-current', 'page')
  await expect(firstOfPage2).toBeVisible()

  await page.goForward()
  await expect(page).toHaveURL(/year=1981/)
  await expect(yearField).toHaveValue('1981')
})
