import type { Page } from '@playwright/test'
import {
  emptyWinnersResponse,
  intervalsResponse,
  studiosResponse,
  winnersByYear2018Response,
  yearsResponse,
} from '../../src/features/dashboard/testing/fixtures.ts'

const winnersByYear1990Response = [
  {
    id: 1,
    year: 1990,
    title: 'The Adventures of Ford Fairlane',
    studios: [],
    producers: [],
    winner: true,
  },
]

function winnersFor(year: string | null): unknown[] {
  if (year === '2018') return winnersByYear2018Response
  if (year === '1990') return winnersByYear1990Response
  return emptyWinnersResponse
}

// Responde os endpoints do Dashboard com as mesmas fixtures dos testes de componente.
export async function mockDashboardApi(page: Page): Promise<void> {
  await page.route('**/challenge.outsera.tech/api/movies/**', async (route) => {
    const url = new URL(route.request().url())
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'yearsWithMultipleWinners':
        return route.fulfill({ json: yearsResponse })
      case 'studiosWithWinCount':
        return route.fulfill({ json: studiosResponse })
      case 'maxMinWinIntervalForProducers':
        return route.fulfill({ json: intervalsResponse })
      case 'winnersByYear':
        return route.fulfill({ json: winnersFor(url.searchParams.get('year')) })
      default:
        return route.fulfill({ status: 404, json: {} })
    }
  })
}
