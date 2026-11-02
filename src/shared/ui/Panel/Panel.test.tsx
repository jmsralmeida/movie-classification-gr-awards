import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Panel } from './Panel'
import type { PanelProps, PanelStatus } from './Panel.types'

function renderPanel(props: Partial<PanelProps> = {}) {
  const onRetry = vi.fn()
  render(
    <Panel
      title="Sample panel"
      status="success"
      emptyMessage="Nothing here."
      onRetry={onRetry}
      controls={<input aria-label="Sample control" />}
      {...props}
    >
      <p>Panel content</p>
    </Panel>,
  )
  return { onRetry }
}

const ALL_STATUSES: PanelStatus[] = ['loading', 'error', 'empty', 'success']

describe('Panel', () => {
  it.each(ALL_STATUSES)('always shows the title as a level 2 heading (%s)', (status) => {
    renderPanel({ status })

    expect(screen.getByRole('heading', { level: 2, name: 'Sample panel' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Sample panel' })).toBeInTheDocument()
  })

  it.each(ALL_STATUSES)('keeps the controls visible (%s)', (status) => {
    renderPanel({ status })

    expect(screen.getByRole('textbox', { name: 'Sample control' })).toBeVisible()
  })

  it('delegates the error state to the status message, wired to onRetry', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderPanel({ status: 'error' })

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows the children on success', () => {
    renderPanel({ status: 'success' })

    expect(screen.getByText('Panel content')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each(['loading', 'error', 'empty'] as const)('hides the children when %s', (status) => {
    renderPanel({ status })

    expect(screen.queryByText('Panel content')).not.toBeInTheDocument()
  })
})
