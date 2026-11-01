import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable'
import type { Column } from './DataTable.types'

interface Row {
  id: number
  name: string
}

const columns: Column<Row>[] = [
  { id: 'id', header: 'Id', render: (row) => row.id },
  { id: 'name', header: 'Name', render: (row) => row.name },
]

function renderTable(rows: Row[], emptyMessage?: string) {
  render(
    <DataTable
      caption="Sample rows"
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      emptyMessage={emptyMessage}
    />,
  )
}

describe('DataTable', () => {
  it('names the table from its caption and renders one header per column', () => {
    renderTable([{ id: 1, name: 'A' }])

    expect(screen.getByRole('table', { name: 'Sample rows' })).toBeInTheDocument()
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((header) => header.textContent)).toEqual(['Id', 'Name'])
    headers.forEach((header) => expect(header).toHaveAttribute('scope', 'col'))
  })

  it('renders one row per item, in the received order', () => {
    renderTable([
      { id: 2, name: 'Second' },
      { id: 1, name: 'First' },
    ])

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((row) => row.textContent)).toEqual(['2Second', '1First'])
  })

  it('shows the empty message in one cell spanning all columns only when there are no rows', () => {
    renderTable([], 'Nothing to show.')

    const cell = screen.getByRole('cell', { name: 'Nothing to show.' })
    expect(cell).toHaveAttribute('colspan', '2')
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })

  it('does not show the empty message when there are rows', () => {
    renderTable([{ id: 1, name: 'A' }], 'Nothing to show.')

    expect(screen.queryByText('Nothing to show.')).not.toBeInTheDocument()
  })

  it('has no body row without rows and without an empty message', () => {
    renderTable([])

    expect(screen.getAllByRole('row')).toHaveLength(1)
    expect(screen.queryByRole('cell')).not.toBeInTheDocument()
  })

  it('renders cell content as text, never as HTML', () => {
    renderTable([{ id: 1, name: '<b>x</b> &amp; y' }])

    const [, row] = screen.getAllByRole('row') as [HTMLElement, HTMLElement]
    expect(within(row).getByText('<b>x</b> &amp; y')).toBeInTheDocument()
    expect(row.querySelector('b')).toBeNull()
  })
})
