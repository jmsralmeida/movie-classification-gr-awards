import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { yearsResponse } from '../testing/fixtures'
import { dashboardHandlers } from '../testing/handlers'
import { YearsPanel } from './YearsPanel'

describe('YearsPanel', () => {
  beforeEach(() => {
    server.use(...dashboardHandlers)
  })

  it('shows the title and one row per year with its win count', async () => {
    const requested: string[] = []
    server.use(
      http.get(`${apiBaseUrl}/yearsWithMultipleWinners`, ({ request }) => {
        requested.push(new URL(request.url).pathname)
        return HttpResponse.json(yearsResponse)
      }),
    )

    renderWithProviders(<YearsPanel />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'List years with multiple winners' }),
    ).toBeInTheDocument()
    const table = await screen.findByRole('table', { name: 'Years with multiple winners' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['Year', 'Win Count'])
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((row) => row.textContent)).toEqual(['19862', '19902', '20152'])
    expect(requested).toEqual(['/api/movies/yearsWithMultipleWinners'])
  })
})
