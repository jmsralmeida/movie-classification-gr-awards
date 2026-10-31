import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders the title in the banner, the navigation, and the children inside main', () => {
    render(
      <AppShell title="Test app" nav={<nav aria-label="Side">links</nav>}>
        <p>Page content</p>
      </AppShell>,
    )

    expect(within(screen.getByRole('banner')).getByText('Test app')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Side' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByText('Page content')).toBeInTheDocument()
  })
})
