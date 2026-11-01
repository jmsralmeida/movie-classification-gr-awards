import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { dashboardHandlers } from '../features/dashboard/testing/handlers'
import { listHandlers } from '../features/list/testing/handlers'
import { renderWithProviders } from '../test/render'
import { server } from '../test/server'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    server.use(...dashboardHandlers, ...listHandlers)
  })

  it('shows the app title in the banner', () => {
    renderWithProviders(<App />)

    expect(within(screen.getByRole('banner')).getByText('Outsera Razzies')).toBeInTheDocument()
  })

  it('lists exactly Dashboard and List, in this order, in the navigation', () => {
    renderWithProviders(<App />)

    const links = within(screen.getByRole('navigation')).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(['Dashboard', 'List'])
  })

  it('redirects the root to the Dashboard', () => {
    renderWithProviders(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
  })

  it('switches to the List view when the List link is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)

    await user.click(screen.getByRole('link', { name: 'List' }))

    expect(screen.getByRole('heading', { level: 1, name: 'List movies' })).toBeInTheDocument()
  })

  it('marks the link of the current view with aria-current and follows the navigation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />)
    const nav = within(screen.getByRole('navigation'))
    expect(nav.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
    expect(nav.getByRole('link', { name: 'List' })).not.toHaveAttribute('aria-current')

    await user.click(nav.getByRole('link', { name: 'List' }))

    expect(nav.getByRole('link', { name: 'List' })).toHaveAttribute('aria-current', 'page')
    expect(nav.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('opens the first page without filters when the List link is used from a filtered list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/list?page=2&winner=true' })
    expect(screen.getByRole('combobox', { name: 'Filter by winner' })).toHaveValue('true')

    await user.click(screen.getByRole('link', { name: 'List' }))

    expect(screen.getByRole('combobox', { name: 'Filter by winner' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Filter by year' })).toHaveValue('')
    expect(await screen.findByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it.each(['/List', '/list/'])('opens the List view at %s', (route) => {
    renderWithProviders(<App />, { route })

    expect(screen.getByRole('heading', { level: 1, name: 'List movies' })).toBeInTheDocument()
  })

  it('shows "Page not found" inside the shell for an unknown URL', () => {
    renderWithProviders(<App />, { route: '/nowhere' })

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('goes back to the Dashboard from the not found page', async () => {
    const user = userEvent.setup()
    renderWithProviders(<App />, { route: '/nowhere' })

    await user.click(screen.getByRole('link', { name: 'Go to Dashboard' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
  })
})
