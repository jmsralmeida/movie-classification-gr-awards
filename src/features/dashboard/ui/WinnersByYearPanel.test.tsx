import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { winnersByYear2018Response, winnersWithTiesResponse } from '../testing/fixtures'
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

  describe('search form', () => {
    async function search(
      user: ReturnType<typeof userEvent.setup>,
      text: string,
      how: 'click' | 'enter',
    ) {
      const field = screen.getByRole('textbox', { name: 'Search by year' })
      await user.clear(field)
      await user.type(field, how === 'enter' ? `${text}{Enter}` : text)
      if (how === 'click') await user.click(screen.getByRole('button', { name: 'Search' }))
    }

    it.each(['click', 'enter'] as const)('searches by %s and shows the table', async (how) => {
      const user = userEvent.setup()
      renderWithProviders(<WinnersByYearPanel />)

      await search(user, '1990', how)

      expect(await screen.findByRole('cell', { name: 'First Winner' })).toBeInTheDocument()
      expect(requestedYears).toEqual(['1990'])
    })

    it.each(['click', 'enter'] as const)(
      'keeps focus where the user was after a valid search by %s',
      async (how) => {
        const user = userEvent.setup()
        renderWithProviders(<WinnersByYearPanel />)

        await search(user, '1990', how)
        await screen.findByRole('cell', { name: 'First Winner' })

        const target =
          how === 'enter'
            ? screen.getByRole('textbox', { name: 'Search by year' })
            : screen.getByRole('button', { name: 'Search' })
        expect(target).toHaveFocus()
      },
    )

    it('swaps the table when a new year is searched', async () => {
      const user = userEvent.setup()
      renderWithProviders(<WinnersByYearPanel />)

      await search(user, '1990', 'click')
      await screen.findByRole('cell', { name: 'First Winner' })
      await search(user, '2000', 'click')

      expect(await screen.findByText('No winners found for 2000.')).toBeInTheDocument()
      expect(screen.queryByRole('cell', { name: 'First Winner' })).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Search by year' })).toHaveValue('2000')
    })

    it.each(['', 'abc'])(
      'rejects %j with a message tied to the field and no request',
      async (text) => {
        const user = userEvent.setup()
        renderWithProviders(<WinnersByYearPanel />)

        if (text === '') {
          await user.click(screen.getByRole('button', { name: 'Search' }))
        } else {
          await search(user, text, 'click')
        }

        const field = screen.getByRole('textbox', { name: 'Search by year' })
        const message = screen.getByText('Enter a 4-digit year.')
        expect(field).toHaveAttribute('aria-invalid', 'true')
        expect(field).toHaveAccessibleDescription('Enter a 4-digit year.')
        expect(message).toBeInTheDocument()
        expect(screen.getByRole('alert')).toHaveTextContent('Enter a 4-digit year.')
        expect(requestedYears).toEqual([])
      },
    )

    it('clears the message after a valid search', async () => {
      const user = userEvent.setup()
      renderWithProviders(<WinnersByYearPanel />)

      await search(user, 'abc', 'click')
      expect(screen.getByText('Enter a 4-digit year.')).toBeInTheDocument()
      await search(user, '1990', 'click')

      await screen.findByRole('cell', { name: 'First Winner' })
      expect(screen.queryByText('Enter a 4-digit year.')).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Search by year' })).not.toHaveAttribute(
        'aria-invalid',
      )
    })

    it('accepts a year with surrounding spaces', async () => {
      const user = userEvent.setup()
      renderWithProviders(<WinnersByYearPanel />)

      await search(user, ' 1990 ', 'click')

      expect(await screen.findByRole('cell', { name: 'First Winner' })).toBeInTheDocument()
      expect(requestedYears).toEqual(['1990'])
    })

    it('fills the field with the year from the URL', async () => {
      renderWithProviders(<WinnersByYearPanel />, { route: '/dashboard?year=2018' })

      expect(screen.getByRole('textbox', { name: 'Search by year' })).toHaveValue('2018')
      await screen.findByText('No winners found for 2018.')
    })

    it('makes a single request on a fast double click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<WinnersByYearPanel />)
      await user.type(screen.getByRole('textbox', { name: 'Search by year' }), '1990')

      await user.dblClick(screen.getByRole('button', { name: 'Search' }))

      await screen.findByRole('cell', { name: 'First Winner' })
      expect(requestedYears).toEqual(['1990'])
    })

    it('shows the last searched year after searching two in a row', async () => {
      const user = userEvent.setup()
      renderWithProviders(<WinnersByYearPanel />)

      await search(user, '2018', 'click')
      await search(user, '1990', 'click')

      expect(await screen.findByRole('cell', { name: 'First Winner' })).toBeInTheDocument()
      expect(screen.queryByText('No winners found for 2018.')).not.toBeInTheDocument()
    })
  })

  it('keeps the field and the typed year on error and retries the same year', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${apiBaseUrl}/winnersByYear`, ({ request }) => {
        requestedYears.push(new URL(request.url).searchParams.get('year'))
        return new HttpResponse(null, { status: 500 })
      }),
    )
    renderWithProviders(<WinnersByYearPanel />, { route: '/dashboard?year=2018' })

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load this data.')
    expect(screen.getByRole('textbox', { name: 'Search by year' })).toHaveValue('2018')

    server.use(
      http.get(`${apiBaseUrl}/winnersByYear`, ({ request }) => {
        requestedYears.push(new URL(request.url).searchParams.get('year'))
        return HttpResponse.json(winnersByYear2018Response)
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('cell', { name: 'Holmes & Watson' })).toBeInTheDocument()
    expect(requestedYears).toEqual(['2018', '2018'])
    expect(screen.getByRole('textbox', { name: 'Search by year' })).toHaveValue('2018')
  })
})
