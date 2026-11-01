import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { winnersWithTiesResponse } from '../testing/fixtures'
import { dashboardHandlers } from '../testing/handlers'
import { WinnersByYearPanel } from './WinnersByYearPanel'

const INITIAL_MESSAGE = 'Enter a year (e.g. 2018) to see its winners.'

let requestedYears: (string | null)[]

function bodyRows() {
  const table = screen.getByRole('table', { name: 'Winners of the selected year' })
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent)
}

describe('WinnersByYearPanel', () => {
  beforeEach(() => {
    requestedYears = []
    // O primeiro handler que casa vence: o que registra os anos pedidos vem antes dos padrões.
    server.use(
      http.get(`${apiBaseUrl}/winnersByYear`, ({ request }) => {
        const year = new URL(request.url).searchParams.get('year')
        requestedYears.push(year)
        return HttpResponse.json(year === '1990' ? winnersWithTiesResponse : [])
      }),
      ...dashboardHandlers,
    )
  })

  it('shows the instruction and no request before a year is searched', async () => {
    renderWithProviders(<WinnersByYearPanel />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'List movie winners by year' }),
    ).toBeInTheDocument()
    expect(await screen.findByText(INITIAL_MESSAGE)).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Id',
      'Year',
      'Title',
    ])
    expect(requestedYears).toEqual([])
  })

  it.each(['?year=abc', '?year='])('behaves as no search for %s', async (query) => {
    renderWithProviders(<WinnersByYearPanel />, { route: `/dashboard${query}` })

    expect(await screen.findByText(INITIAL_MESSAGE)).toBeInTheDocument()
    expect(requestedYears).toEqual([])
  })

  it('lists the winner of the year in the URL and requests that year', async () => {
    server.use(
      http.get(`${apiBaseUrl}/winnersByYear`, ({ request }) => {
        requestedYears.push(new URL(request.url).searchParams.get('year'))
        return HttpResponse.json([
          {
            id: 197,
            year: 2018,
            title: 'Holmes & Watson',
            studios: [],
            producers: [],
            winner: true,
          },
        ])
      }),
    )

    renderWithProviders(<WinnersByYearPanel />, { route: '/dashboard?year=2018' })

    expect(await screen.findByRole('cell', { name: 'Holmes & Watson' })).toBeInTheDocument()
    expect(bodyRows()).toEqual(['1972018Holmes & Watson'])
    expect(requestedYears).toEqual(['2018'])
  })

  it('lists every winner when the year has more than one', async () => {
    renderWithProviders(<WinnersByYearPanel />, { route: '/dashboard?year=1990' })

    expect(await screen.findByRole('cell', { name: 'First Winner' })).toBeInTheDocument()
    expect(bodyRows()).toEqual(['1011990First Winner', '1021990Second Winner'])
  })
})
