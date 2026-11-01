import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import { respondToMoviesQuery } from '../testing/fixtures'
import { listHandlers } from '../testing/handlers'
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

// Segura a resposta da API até o teste liberá-la (sem atraso fixo).
function holdResponses() {
  let release: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  server.use(
    http.get(apiBaseUrl, async ({ request }) => {
      await gate
      const { status, body } = respondToMoviesQuery(new URL(request.url).searchParams)
      return HttpResponse.json(body as JsonBodyType, { status })
    }),
  )
  return release
}

function renderList(route = '/list') {
  return renderWithProviders(<ListPage />, { route })
}

const bodyRows = () => screen.getAllByRole('row').slice(1)
const firstCellsOf = (rows: HTMLElement[]) =>
  rows.map((row) => Number(within(row).getAllByRole('cell')[0]?.textContent))
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index)

async function waitForRows(ids: number[]) {
  await waitFor(() => expect(firstCellsOf(bodyRows())).toEqual(ids))
}

describe('ListPage', () => {
  beforeEach(() => {
    server.use(...listHandlers)
  })

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

  describe('pagination', () => {
    it('goes to the next page and sends the matching page to the API', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))

      await user.click(screen.getByRole('button', { name: 'Next page' }))

      await waitForRows(range(16, 30))
      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
      expect(requests.at(-1)?.get('page')).toBe('1')
    })

    it('goes to the previous, first and last page and to a numbered page', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList('/list?page=2')
      await waitForRows(range(16, 30))

      await user.click(screen.getByRole('button', { name: 'Previous page' }))
      await waitForRows(range(1, 15))
      expect(requests.at(-1)?.get('page')).toBe('0')

      await user.click(screen.getByRole('button', { name: 'Last page' }))
      await waitForRows(range(31, 40))
      expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
      expect(requests.at(-1)?.get('page')).toBe('2')

      await user.click(screen.getByRole('button', { name: 'First page' }))
      await waitForRows(range(1, 15))
      expect(requests.at(-1)?.get('page')).toBe('0')

      await user.click(screen.getByRole('button', { name: 'Page 3' }))
      await waitForRows(range(31, 40))
      expect(requests.at(-1)?.get('page')).toBe('2')
    })

    it('keeps keyboard focus on "Next page" while the next page loads and after it arrives', async () => {
      const user = userEvent.setup()
      renderList()
      await waitForRows(range(1, 15))
      const next = screen.getByRole('button', { name: 'Next page' })
      next.focus()
      const release = holdResponses()

      await user.keyboard('{Enter}')

      expect(next).toHaveFocus()
      expect(firstCellsOf(bodyRows())).toEqual(range(1, 15))
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
      release()
      await waitForRows(range(16, 30))
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus()
    })

    it('keeps the focus on the button that becomes unavailable at the last and first page', async () => {
      const user = userEvent.setup()
      renderList('/list?page=2')
      await waitForRows(range(16, 30))

      const next = screen.getByRole('button', { name: 'Next page' })
      next.focus()
      await user.keyboard('{Enter}')
      await waitForRows(range(31, 40))
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveFocus()

      const previous = screen.getByRole('button', { name: 'Previous page' })
      previous.focus()
      await user.keyboard('{Enter}')
      await waitForRows(range(16, 30))
      await user.keyboard('{Enter}')
      await waitForRows(range(1, 15))
      expect(screen.getByRole('button', { name: 'Previous page' })).toHaveAttribute(
        'aria-disabled',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus()
    })
  })
})
