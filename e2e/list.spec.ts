import { expect, test } from '@playwright/test'
import { respondToMoviesQuery } from '../src/features/list/testing/fixtures.ts'
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

test('real CSS layout: filters in the header, full pagination and no horizontal scroll at 768 and 1440', async ({
  page,
}) => {
  const LONG_TITLE = 'A'.repeat(80)
  const isTablet = (page.viewportSize()?.width ?? 0) <= 768
  await mockListApi(page)
  if (isTablet) {
    // Sobrescreve a rota (a última registrada vence) com um título longo e sem espaços.
    await page.route(/\/api\/movies(\?.*)?$/, async (route) => {
      const { status, body } = respondToMoviesQuery(new URL(route.request().url()).searchParams)
      const content = (body as { content: { title: string }[] }).content
      if (content[0] !== undefined) content[0].title = LONG_TITLE
      return route.fulfill({ status, json: body })
    })
  }

  await page.goto('/list')

  await expect(page.getByRole('heading', { level: 1, name: 'List movies' })).toBeVisible()
  await expect(page.getByRole('row')).toHaveCount(16)

  const headers = page.getByRole('columnheader')
  const controls = [
    [headers.nth(1), page.getByRole('textbox', { name: 'Filter by year' })],
    [headers.nth(3), page.getByRole('combobox', { name: 'Filter by winner' })],
  ] as const
  for (const [header, control] of controls) {
    await expect(control).toBeVisible()
    const headerBox = await header.boundingBox()
    const controlBox = await control.boundingBox()
    expect(headerBox).not.toBeNull()
    expect(controlBox).not.toBeNull()
    expect(controlBox!.x).toBeGreaterThanOrEqual(headerBox!.x)
    expect(controlBox!.y).toBeGreaterThanOrEqual(headerBox!.y)
    expect(controlBox!.x + controlBox!.width).toBeLessThanOrEqual(headerBox!.x + headerBox!.width)
    expect(controlBox!.y + controlBox!.height).toBeLessThanOrEqual(headerBox!.y + headerBox!.height)
  }

  const pagination = page.getByRole('navigation', { name: 'Pagination' })
  const buttons = [
    pagination.getByRole('button', { name: 'First page' }),
    pagination.getByRole('button', { name: 'Page 1' }),
    pagination.getByRole('button', { name: 'Last page' }),
  ]
  const tops: (number | undefined)[] = []
  for (const button of buttons) {
    await expect(button).toBeVisible()
    tops.push((await button.boundingBox())?.y)
  }
  expect(new Set(tops).size).toBe(1)

  const hasHorizontalScroll = await page
    .locator('html')
    .evaluate((root) => root.scrollWidth > root.clientWidth)
  expect(hasHorizontalScroll).toBe(false)

  if (isTablet) {
    const titleCell = page.getByRole('cell', { name: LONG_TITLE })
    await expect(titleCell).toBeVisible()
    const tableBox = await page.getByRole('table', { name: 'Movies' }).boundingBox()
    const cellBox = await titleCell.boundingBox()
    expect(cellBox!.x + cellBox!.width).toBeLessThanOrEqual(tableBox!.x + tableBox!.width)
  }
})
