import { expect, test, type Page } from '@playwright/test'
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

const TITLES = {
  years: 'List years with multiple winners',
  producers: 'Producers with longest and shortest interval between wins',
  studios: 'Top 3 studios with winners',
  search: 'List movie winners by year',
}

async function panelBoxes(page: Page) {
  const entries = await Promise.all(
    Object.entries(TITLES).map(async ([key, name]) => {
      const panel = page.getByRole('region', { name })
      await expect(panel).toBeVisible()
      const box = await panel.boundingBox()
      if (box === null) throw new Error(`Panel "${name}" has no bounding box`)
      return [key, box] as const
    }),
  )
  return Object.fromEntries(entries) as Record<keyof typeof TITLES, (typeof entries)[number][1]>
}

function hasHorizontalScroll(page: Page) {
  return page.getByRole('main').evaluate((el) => {
    const root = el.ownerDocument.documentElement
    return root.scrollWidth > root.clientWidth
  })
}

test('real CSS layout: two columns at 1440, one column without horizontal scroll at 768', async ({
  page,
}) => {
  const isDesktop = test.info().project.name === 'desktop-1440'
  await mockDashboardApi(page)
  const longName = 'X'.repeat(80)
  if (!isDesktop) {
    await page.route('**/challenge.outsera.tech/api/movies/studiosWithWinCount', (route) =>
      route.fulfill({ json: { studios: [{ name: longName, winCount: 9 }] } }),
    )
  }
  await page.goto('/dashboard')
  await expect(page.getByRole('cell', { name: '1986' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Matthew Vaughn' })).toBeVisible()

  const boxes = await panelBoxes(page)

  if (isDesktop) {
    expect(boxes.studios.y).toBe(boxes.years.y)
    expect(boxes.studios.x).toBeGreaterThan(boxes.years.x)
    expect(boxes.producers.y).toBeGreaterThan(boxes.years.y)
  } else {
    const ordered = [boxes.years, boxes.producers, boxes.studios, boxes.search]
    for (const box of ordered) expect(box.x).toBe(boxes.years.x)
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]!.y).toBeGreaterThan(ordered[i - 1]!.y)
    }

    const cell = page.getByRole('cell', { name: longName })
    await expect(cell).toBeVisible()
    const cellBox = await cell.boundingBox()
    expect(cellBox).not.toBeNull()
    expect(cellBox!.x + cellBox!.width).toBeLessThanOrEqual(boxes.studios.x + boxes.studios.width)
  }

  expect(await hasHorizontalScroll(page)).toBe(false)
})

test('real CSS: the search field and button show a focus ring when reached with Tab', async ({
  page,
}) => {
  await mockDashboardApi(page)
  await page.goto('/dashboard')
  const field = page.getByRole('textbox', { name: 'Search by year' })
  const button = page.getByRole('button', { name: 'Search' })
  await expect(field).toBeVisible()

  await field.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(field).toBeFocused()
  await expect(field).not.toHaveCSS('outline-style', 'none')

  await page.keyboard.press('Tab')
  await expect(button).toBeFocused()
  await expect(button).not.toHaveCSS('outline-style', 'none')
})
