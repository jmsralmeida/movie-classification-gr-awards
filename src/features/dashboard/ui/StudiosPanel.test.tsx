import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { studiosResponse } from '../testing/fixtures'
import { dashboardHandlers } from '../testing/handlers'
import { StudiosPanel } from './StudiosPanel'

async function findBodyRows() {
  const table = await screen.findByRole('table', { name: 'Top 3 studios by wins' })
  return within(table).getAllByRole('row').slice(1)
}

describe('StudiosPanel', () => {
  beforeEach(() => {
    server.use(...dashboardHandlers)
  })

  it('shows only the first three studios of the full list, in the API order', async () => {
    renderWithProviders(<StudiosPanel />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Top 3 studios with winners' }),
    ).toBeInTheDocument()
    const rows = await findBodyRows()
    expect(rows.map((row) => row.textContent)).toEqual([
      'Columbia Pictures6',
      'Paramount Pictures6',
      'Warner Bros.5',
    ])
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Name',
      'Win Count',
    ])
  })

  it('shows every studio when the API returns fewer than three', async () => {
    server.use(
      http.get(`${apiBaseUrl}/studiosWithWinCount`, () =>
        HttpResponse.json({ studios: studiosResponse.studios.slice(0, 2) }),
      ),
    )

    renderWithProviders(<StudiosPanel />)

    expect(await findBodyRows()).toHaveLength(2)
  })
})
