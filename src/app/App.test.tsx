import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../test/render'
import { App } from './App'

describe('App', () => {
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

    expect(screen.getByRole('heading', { level: 1, name: 'List' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'List' })).toHaveAttribute('aria-current', 'page')
  })

  it.each(['/List', '/list/'])('opens the List view at %s', (route) => {
    renderWithProviders(<App />, { route })

    expect(screen.getByRole('heading', { level: 1, name: 'List' })).toBeInTheDocument()
  })
})
