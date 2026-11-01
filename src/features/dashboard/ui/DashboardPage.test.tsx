import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse, type JsonBodyType } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { apiBaseUrl } from '../../../shared/api/config'
import { renderWithProviders } from '../../../test/render'
import { server } from '../../../test/server'
import {
  emptyIntervalsResponse,
  emptyStudiosResponse,
  emptyWinnersResponse,
  emptyYearsResponse,
  intervalsResponse,
  studiosResponse,
  winnersByYear2018Response,
  yearsResponse,
} from '../testing/fixtures'
import { DashboardPage } from './DashboardPage'

interface PanelCase {
  title: string
  endpoint: string
  body: JsonBodyType
  emptyBody: JsonBodyType
  emptyMessage: string
  dataText: string
}

const panels: PanelCase[] = [
  {
    title: 'List years with multiple winners',
    endpoint: 'yearsWithMultipleWinners',
    body: yearsResponse,
    emptyBody: emptyYearsResponse,
    emptyMessage: 'No years with multiple winners.',
    dataText: '1986',
  },
  {
    title: 'Top 3 studios with winners',
    endpoint: 'studiosWithWinCount',
    body: studiosResponse,
    emptyBody: emptyStudiosResponse,
    emptyMessage: 'No studios found.',
    dataText: 'Columbia Pictures',
  },
  {
    title: 'Producers with longest and shortest interval between wins',
    endpoint: 'maxMinWinIntervalForProducers',
    body: intervalsResponse,
    emptyBody: emptyIntervalsResponse,
    emptyMessage: 'No producers with multiple wins.',
    dataText: 'Matthew Vaughn',
  },
  {
    title: 'List movie winners by year',
    endpoint: 'winnersByYear',
    body: winnersByYear2018Response,
    emptyBody: emptyWinnersResponse,
    emptyMessage: 'No winners found for 2018.',
    dataText: 'Holmes & Watson',
  },
]

let requestCounts: Record<string, number>

function respondWith(panel: PanelCase, body: JsonBodyType) {
  return http.get(`${apiBaseUrl}/${panel.endpoint}`, () => {
    requestCounts[panel.endpoint] = (requestCounts[panel.endpoint] ?? 0) + 1
    return HttpResponse.json(body)
  })
}

function region(title: string) {
  return screen.getByRole('region', { name: title })
}

async function expectData(panel: PanelCase) {
  expect(await within(region(panel.title)).findByText(panel.dataText)).toBeInTheDocument()
}

function renderDashboard() {
  renderWithProviders(<DashboardPage />, { route: '/dashboard?year=2018' })
}

describe('DashboardPage panels are independent', () => {
  beforeEach(() => {
    requestCounts = {}
    server.use(...panels.map((panel) => respondWith(panel, panel.body)))
  })

  describe.each(panels)('$title', (panel) => {
    const others = panels.filter((other) => other !== panel)

    it('is the only one loading while its endpoint is slow', async () => {
      server.use(
        http.get(`${apiBaseUrl}/${panel.endpoint}`, async () => {
          await delay('infinite')
          return HttpResponse.json(panel.body)
        }),
      )

      renderDashboard()

      for (const other of others) await expectData(other)
      const own = within(region(panel.title))
      expect(own.getByRole('status')).toHaveTextContent('Loading')
      expect(own.queryByText(panel.dataText)).not.toBeInTheDocument()
      expect(own.getByRole('heading', { level: 2, name: panel.title })).toBeVisible()
    })

    it('is the only one empty when its endpoint returns an empty result', async () => {
      server.use(respondWith(panel, panel.emptyBody))

      renderDashboard()

      expect(await within(region(panel.title)).findByText(panel.emptyMessage)).toBeInTheDocument()
      for (const other of others) {
        await expectData(other)
        expect(within(region(other.title)).queryByText(other.emptyMessage)).not.toBeInTheDocument()
      }
    })

    it('is the only one in error on a 500 and retries only its own request', async () => {
      const user = userEvent.setup()
      server.use(
        http.get(`${apiBaseUrl}/${panel.endpoint}`, () => new HttpResponse(null, { status: 500 })),
      )
      renderDashboard()

      const own = within(region(panel.title))
      expect(await own.findByRole('alert')).toHaveTextContent('Could not load this data.')
      for (const other of others) {
        await expectData(other)
        expect(within(region(other.title)).queryByRole('alert')).not.toBeInTheDocument()
      }
      const before = { ...requestCounts }

      server.use(respondWith(panel, panel.body))
      await user.click(own.getByRole('button', { name: 'Try again' }))

      await expectData(panel)
      expect(own.queryByRole('alert')).not.toBeInTheDocument()
      for (const other of others) {
        expect(requestCounts[other.endpoint]).toBe(before[other.endpoint])
        expect(requestCounts[other.endpoint]).toBe(1)
      }
      expect(requestCounts[panel.endpoint]).toBe(1)
    })
  })

  it('turns a malformed response into an error of that panel only', async () => {
    server.use(http.get(`${apiBaseUrl}/yearsWithMultipleWinners`, () => HttpResponse.json({})))

    renderDashboard()

    const years = within(region('List years with multiple winners'))
    expect(await years.findByRole('alert')).toBeInTheDocument()
    for (const other of panels.slice(1)) await expectData(other)
  })
})
