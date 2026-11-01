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
