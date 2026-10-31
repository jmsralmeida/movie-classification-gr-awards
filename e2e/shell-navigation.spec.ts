import { expect, test } from '@playwright/test'

test('browser back button and a URL opened directly show the right view and current link', async ({
  page,
}) => {
  await page.goto('/list')
  await expect(page.getByRole('heading', { level: 1, name: 'List' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'List' })).toHaveAttribute('aria-current', 'page')

  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/list$/)
  await expect(page.getByRole('heading', { level: 1, name: 'List' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'List' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
})

test('Tab and Enter walk the menu links and the focus ring is visible', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()
  const dashboard = page.getByRole('link', { name: 'Dashboard' })
  const list = page.getByRole('link', { name: 'List' })

  await page.keyboard.press('Tab')
  await expect(dashboard).toBeFocused()
  await expect(dashboard).not.toHaveCSS('outline-style', 'none')

  await page.keyboard.press('Tab')
  await expect(list).toBeFocused()
  await expect(list).not.toHaveCSS('outline-style', 'none')

  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'List' })).toBeVisible()
})

test('no horizontal scroll; header and menu stay in place while tall content scrolls', async ({
  page,
}) => {
  await page.goto('/dashboard')

  const header = page.getByRole('banner')
  const menu = page.getByRole('navigation', { name: 'Main' })
  const main = page.getByRole('main')
  await expect(header).toBeVisible()
  await expect(menu).toBeVisible()
  await expect(main).toBeVisible()

  const hasHorizontalScroll = await main.evaluate((el) => {
    const root = el.ownerDocument.documentElement
    return root.scrollWidth > root.clientWidth
  })
  expect(hasHorizontalScroll).toBe(false)

  await main.evaluate((el) => {
    const spacer = el.ownerDocument.createElement('div')
    spacer.style.height = '4000px'
    el.appendChild(spacer)
    el.ownerDocument.defaultView?.scrollTo(0, 1500)
  })
  await expect
    .poll(() => main.evaluate((el) => el.ownerDocument.defaultView?.scrollY ?? 0))
    .toBeGreaterThan(0)

  await expect.poll(async () => (await header.boundingBox())?.y).toBe(0)
  await expect(menu).toBeInViewport()
  await expect(page.getByRole('link', { name: 'List' })).toBeInViewport()
})

test('with the API blocked the shell still loads and navigates', async ({ page }) => {
  await page.route('**/api/**', (route) => route.abort())

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible()

  await page.getByRole('link', { name: 'List' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'List' })).toBeVisible()
})
