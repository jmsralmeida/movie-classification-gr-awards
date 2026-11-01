import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StatusMessage } from './StatusMessage'
import type { StatusMessageProps } from './StatusMessage.types'

function renderMessage(props: Partial<StatusMessageProps> & Pick<StatusMessageProps, 'status'>) {
  const onRetry = vi.fn()
  render(<StatusMessage emptyMessage="Nothing here." onRetry={onRetry} {...props} />)
  return { onRetry }
}

describe('StatusMessage', () => {
  it('shows a loading status', () => {
    renderMessage({ status: 'loading' })

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('shows the error alert and calls onRetry once when "Try again" is clicked', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderMessage({ status: 'error' })

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load this data.')
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('points retryRef at the "Try again" button', () => {
    const retryRef = createRef<HTMLButtonElement>()
    renderMessage({ status: 'error', retryRef })

    expect(retryRef.current).toBe(screen.getByRole('button', { name: 'Try again' }))
  })

  it('shows the received empty message', () => {
    renderMessage({ status: 'empty', emptyMessage: 'No items yet.' })

    expect(screen.getByText('No items yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
