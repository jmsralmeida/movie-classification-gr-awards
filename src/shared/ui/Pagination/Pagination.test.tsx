import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

function renderPagination(page: number, totalPages: number) {
  const onPageChange = vi.fn()
  render(<Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />)
  return { onPageChange }
}

const nav = () => screen.getByRole('navigation', { name: 'Pagination' })

describe('Pagination', () => {
  it('lists the jump buttons around the page window, in order', () => {
    renderPagination(1, 14)

    const names = within(nav())
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'))
    expect(names).toEqual([
      'First page',
      'Previous page',
      'Page 1',
      'Page 2',
      'Page 3',
      'Page 4',
      'Page 5',
      'Next page',
      'Last page',
    ])
  })

  it('marks only the current page with aria-current', () => {
    renderPagination(3, 14)

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(nav().querySelectorAll('[aria-current]')).toHaveLength(1)
  })

  it('leaves First and Previous without a destination on page 1', () => {
    renderPagination(1, 14)

    expect(screen.getByRole('button', { name: 'First page' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Next page' })).not.toHaveAttribute('aria-disabled')
    expect(screen.getByRole('button', { name: 'Last page' })).not.toHaveAttribute('aria-disabled')
  })

  it('leaves Next and Last without a destination on the last page', () => {
    renderPagination(14, 14)

    expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Last page' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'First page' })).not.toHaveAttribute('aria-disabled')
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toHaveAttribute(
      'aria-disabled',
    )
  })

  it('ignores clicks on buttons without a destination, which stay focusable', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination(1, 14)

    await user.tab()
    const first = screen.getByRole('button', { name: 'First page' })
    expect(first).toHaveFocus()
    await user.click(first)
    await user.click(screen.getByRole('button', { name: 'Previous page' }))

    expect(first).not.toBeDisabled()
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it.each([
    ['First page', 1],
    ['Previous page', 6],
    ['Page 8', 8],
    ['Next page', 8],
    ['Last page', 14],
  ])('calls onPageChange from page 7 when "%s" is clicked', async (name, expected) => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination(7, 14)

    await user.click(screen.getByRole('button', { name }))

    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(expected)
  })

  it('handles a page beyond the total: no current page and valid ways back', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination(99, 14)

    expect(nav().querySelectorAll('[aria-current]')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Previous page' }))
    await user.click(screen.getByRole('button', { name: 'First page' }))
    await user.click(screen.getByRole('button', { name: 'Last page' }))

    expect(onPageChange.mock.calls).toEqual([[14], [1], [14]])
  })

  it('leaves all four jump buttons without a destination when there is a single page', () => {
    renderPagination(1, 1)

    for (const name of ['First page', 'Previous page', 'Next page', 'Last page']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'true')
    }
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
  })
})
