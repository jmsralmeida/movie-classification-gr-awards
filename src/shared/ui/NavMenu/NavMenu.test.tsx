import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { NavMenu } from './NavMenu'
import type { NavItem } from './NavMenu.types'

const items: NavItem[] = [
  { to: '/one', label: 'One' },
  { to: '/two', label: 'Two' },
]

function renderMenu(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <NavMenu items={items} label="Test menu" />
    </MemoryRouter>,
  )
}

describe('NavMenu', () => {
  it('renders the links in the received order inside a labelled navigation', () => {
    renderMenu('/one')

    const nav = screen.getByRole('navigation', { name: 'Test menu' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(['One', 'Two'])
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/one', '/two'])
  })

  it('marks only the link of the current route with aria-current="page"', () => {
    renderMenu('/two')

    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'One' })).not.toHaveAttribute('aria-current')
  })

  it('marks no link on a route outside the list', () => {
    renderMenu('/unknown')

    for (const link of screen.getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current')
    }
  })

  it('does not mark a link for a sub-path of its route', () => {
    renderMenu('/one/xyz')

    for (const link of screen.getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current')
    }
  })
})
