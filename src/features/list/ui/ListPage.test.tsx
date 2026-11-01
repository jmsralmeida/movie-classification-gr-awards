import { screen, within } from '@testing-library/react'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { respondToMoviesQuery } from '../testing/fixtures'
import { ListPage } from './ListPage'

// Responde como a API e guarda os parâmetros de cada requisição.
function recordRequests() {
  const requests: URLSearchParams[] = []
  server.use(
    http.get(apiBaseUrl, ({ request }) => {
      const params = new URL(request.url).searchParams
      requests.push(params)
      const { status, body } = respondToMoviesQuery(params)
      return HttpResponse.json(body as JsonBodyType, { status })
    }),
  )
  return requests
}

function renderList(route = '/list') {
  return renderWithProviders(<ListPage />, { route })
}

const bodyRows = () => screen.getAllByRole('row').slice(1)

describe('ListPage', () => {
  it('shows the title, the table headers and the first page of movies in order', async () => {
    const requests = recordRequests()
    renderList()

    expect(screen.getByRole('heading', { level: 1, name: 'List movies' })).toBeInTheDocument()
    const table = screen.getByRole('table', { name: 'Movies' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['ID', 'Year', 'Title', 'Winner?'])

    expect(await screen.findByRole('cell', { name: "Can't Stop the Music" })).toBeInTheDocument()
    const rows = bodyRows()
    expect(rows).toHaveLength(15)
    expect(rows.map((row) => within(row).getAllByRole('cell')[0]?.textContent)).toEqual(
      Array.from({ length: 15 }, (_, index) => String(index + 1)),
    )
    expect(within(rows[0] as HTMLElement).getAllByRole('cell')[3]).toHaveTextContent('Yes')
    expect(within(rows[1] as HTMLElement).getByRole('cell', { name: 'Cruising' })).toBeVisible()
    expect(within(rows[1] as HTMLElement).getAllByRole('cell')[3]).toHaveTextContent('No')

    expect(requests).toHaveLength(1)
    const [params] = requests
    expect(params?.get('page')).toBe('0')
    expect(params?.get('size')).toBe('15')
    expect(params?.has('year')).toBe(false)
    expect(params?.has('winner')).toBe(false)
  })
})
