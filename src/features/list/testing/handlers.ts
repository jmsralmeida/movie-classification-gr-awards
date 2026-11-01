import { http, HttpResponse, type JsonBodyType, type RequestHandler } from 'msw'
import { apiBaseUrl } from '../../../shared/api/config'
import { respondToMoviesQuery } from './fixtures'

export const listHandlers: RequestHandler[] = [
  http.get(apiBaseUrl, ({ request }) => {
    const { status, body } = respondToMoviesQuery(new URL(request.url).searchParams)
    return HttpResponse.json(body as JsonBodyType, { status })
  }),
]
