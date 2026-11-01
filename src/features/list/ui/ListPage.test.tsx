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
        // Só o texto do próprio título (os filtros também ficam dentro do th).
        .map((header) => header.firstChild?.textContent),
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

  describe('winner filter', () => {
    const winnerSelect = () => screen.getByRole('combobox', { name: 'Filter by winner' })
    const winnerCells = () =>
      bodyRows().map((row) => within(row).getAllByRole('cell')[3]?.textContent)

    it('offers Yes/No, Yes and No, with Yes/No selected by default', () => {
      renderList()

      expect(
        within(winnerSelect())
          .getAllByRole('option')
          .map((option) => option.textContent),
      ).toEqual(['Yes/No', 'Yes', 'No'])
      expect(screen.getByRole('option', { name: 'Yes/No', selected: true })).toBeInTheDocument()
    })

    it('shows only winners when "Yes" is chosen', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))

      await user.selectOptions(winnerSelect(), 'Yes')

      await waitForRows([1, 11, 31])
      expect(winnerCells()).toEqual(['Yes', 'Yes', 'Yes'])
      expect(requests.at(-1)?.get('winner')).toBe('true')
    })

    it('shows only non-winners when "No" is chosen, with the pagination of the filtered total', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))

      await user.selectOptions(winnerSelect(), 'No')

      await waitFor(() => expect(requests.at(-1)?.get('winner')).toBe('false'))
      await waitFor(() => expect(winnerCells()).toEqual(Array(15).fill('No')))
      const pagination = screen.getByRole('navigation', { name: 'Pagination' })
      expect(within(pagination).getByRole('button', { name: 'Page 3' })).toBeInTheDocument()
      expect(within(pagination).queryByRole('button', { name: 'Page 4' })).not.toBeInTheDocument()
    })

    it('goes back to page 1 when the filter changes while on page 3', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList('/list?page=3')
      await waitForRows(range(31, 40))

      await user.selectOptions(winnerSelect(), 'No')

      await waitFor(() => expect(requests.at(-1)?.get('winner')).toBe('false'))
      expect(requests.at(-1)?.get('page')).toBe('0')
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
          'aria-current',
          'page',
        ),
      )
    })

    it('removes the winner parameter when it goes back to Yes/No', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList('/list?winner=true')
      await waitForRows([1, 11, 31])

      await user.selectOptions(winnerSelect(), 'Yes/No')

      await waitForRows(range(1, 15))
      expect(requests.at(-1)?.has('winner')).toBe(false)
    })
  })

  describe('year filter', () => {
    const yearInput = () => screen.getByRole('textbox', { name: 'Filter by year' })
    const winnerSelect = () => screen.getByRole('combobox', { name: 'Filter by winner' })
    const rowYears = () => bodyRows().map((row) => within(row).getAllByRole('cell')[1]?.textContent)
    const rowWinners = () =>
      bodyRows().map((row) => within(row).getAllByRole('cell')[3]?.textContent)

    it('shows only the movies of a 4-digit year, with page 1 and no submit button', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList('/list?page=2')
      await waitForRows(range(16, 30))

      await user.type(yearInput(), '1980')

      await waitForRows(range(1, 10))
      expect(rowYears()).toEqual(Array(10).fill('1980'))
      expect(requests.at(-1)?.get('year')).toBe('1980')
      expect(requests.at(-1)?.get('page')).toBe('0')
      expect(screen.queryByRole('button', { name: /search|apply|filter/i })).not.toBeInTheDocument()
    })

    it('combines the year with the winner filter', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))

      await user.type(yearInput(), '1980')
      await waitForRows(range(1, 10))
      await user.selectOptions(winnerSelect(), 'Yes')

      await waitForRows([1])
      expect(rowYears()).toEqual(['1980'])
      expect(rowWinners()).toEqual(['Yes'])
      expect(requests.at(-1)?.get('year')).toBe('1980')
      expect(requests.at(-1)?.get('winner')).toBe('true')
    })

    it('paginates the filtered total', async () => {
      const user = userEvent.setup()
      renderList()
      await waitForRows(range(1, 15))

      await user.type(yearInput(), '1981')
      await user.selectOptions(winnerSelect(), 'No')

      await waitFor(() => expect(rowWinners()).toEqual(Array(15).fill('No')))
      await waitFor(() => expect(rowYears()).toEqual(Array(15).fill('1981')))
      const pagination = screen.getByRole('navigation', { name: 'Pagination' })
      expect(within(pagination).getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
      expect(within(pagination).queryByRole('button', { name: 'Page 3' })).not.toBeInTheDocument()
    })

    it('removes the year from the next request when the field is emptied', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList('/list?year=1980')
      await waitForRows(range(1, 10))
      expect(yearInput()).toHaveValue('1980')

      await user.clear(yearInput())

      await waitForRows(range(1, 15))
      expect(requests.at(-1)?.has('year')).toBe(false)
    })

    it('does not query nor warn while the year has 1 to 3 digits, keeping the previous list', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))
      const before = requests.length

      await user.type(yearInput(), '19')

      expect(requests).toHaveLength(before)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(yearInput()).not.toHaveAttribute('aria-invalid')
      expect(firstCellsOf(bodyRows())).toEqual(range(1, 15))
    })

    it.each([
      ['abc', 'type'],
      ['19999', 'paste'],
    ])('shows an error linked to the field for %j and does not query it', async (value, how) => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))
      const before = requests.length

      if (how === 'type') {
        await user.type(yearInput(), value)
      } else {
        await user.click(yearInput())
        await user.paste(value)
      }

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent('Enter a 4-digit year.')
      expect(yearInput()).toHaveAttribute('aria-invalid', 'true')
      expect(yearInput()).toHaveAccessibleDescription('Enter a 4-digit year.')
      expect(requests).toHaveLength(before)
    })

    it('keeps the focus in the field when the 4th digit triggers the query', async () => {
      const user = userEvent.setup()
      renderList()
      await waitForRows(range(1, 15))

      await user.type(yearInput(), '1980')

      await waitForRows(range(1, 10))
      expect(yearInput()).toHaveFocus()
    })

    it('accepts a year surrounded by spaces', async () => {
      const user = userEvent.setup()
      const requests = recordRequests()
      renderList()
      await waitForRows(range(1, 15))

      await user.type(yearInput(), ' 1980 ')

      await waitForRows(range(1, 10))
      expect(requests.at(-1)?.get('year')).toBe('1980')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('restoring from the URL', () => {
    it('fills the controls and the table from page, year and winner', async () => {
      renderList('/list?page=2&year=1981&winner=false')

      expect(screen.getByRole('textbox', { name: 'Filter by year' })).toHaveValue('1981')
      expect(screen.getByRole('combobox', { name: 'Filter by winner' })).toHaveValue('false')
      await waitForRows([27, 28, 29, 30])
      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
    })
  })
})
