import { http, HttpResponse, type RequestHandler } from 'msw'
import { apiBaseUrl } from '../../../shared/api/config'
import {
  emptyWinnersResponse,
  intervalsResponse,
  studiosResponse,
  winnersByYear2018Response,
  yearsResponse,
} from './fixtures'

export const dashboardHandlers: RequestHandler[] = [
  http.get(`${apiBaseUrl}/yearsWithMultipleWinners`, () => HttpResponse.json(yearsResponse)),
  http.get(`${apiBaseUrl}/studiosWithWinCount`, () => HttpResponse.json(studiosResponse)),
  http.get(`${apiBaseUrl}/maxMinWinIntervalForProducers`, () =>
    HttpResponse.json(intervalsResponse),
  ),
  http.get(`${apiBaseUrl}/winnersByYear`, ({ request }) => {
    const year = new URL(request.url).searchParams.get('year')
    return HttpResponse.json(year === '2018' ? winnersByYear2018Response : emptyWinnersResponse)
  }),
]
