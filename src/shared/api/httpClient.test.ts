import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../test/server'
import { ApiError } from './apiError'
import { createHttpClient } from './httpClient'

const BASE = 'http://api.test/movies'

async function catchError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('Expected the request to fail')
}

describe('httpClient', () => {
  it('requests baseUrl + path', async () => {
    let requested = ''
    server.use(
      http.get(`${BASE}/items`, ({ request }) => {
        requested = request.url
        return HttpResponse.json({ ok: true })
      }),
    )

    await createHttpClient(BASE).get('/items')

    expect(requested).toBe(`${BASE}/items`)
  })

  it('requests the base URL itself when the path is empty', async () => {
    let requested = ''
    server.use(
      http.get(BASE, ({ request }) => {
        requested = request.url
        return HttpResponse.json([])
      }),
    )

    await createHttpClient(BASE).get('')

    expect(requested).toBe(BASE)
  })

  it('never produces a double slash when the base URL has a trailing slash', async () => {
    let requested = ''
    server.use(
      http.get(`${BASE}/items`, ({ request }) => {
        requested = request.url
        return HttpResponse.json({})
      }),
    )

    await createHttpClient(`${BASE}/`).get('/items')

    expect(requested).toBe(`${BASE}/items`)
  })

  it('sends params and omits undefined ones', async () => {
    let search = ''
    server.use(
      http.get(BASE, ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json([])
      }),
    )

    await createHttpClient(BASE).get('', {
      params: { page: 2, winner: true, year: undefined, title: 'a b' },
    })

    const query = new URLSearchParams(search)
    expect(query.get('page')).toBe('2')
    expect(query.get('winner')).toBe('true')
    expect(query.get('title')).toBe('a b')
    expect(query.has('year')).toBe(false)
  })

  it('returns the parsed body on success', async () => {
    server.use(http.get(BASE, () => HttpResponse.json({ content: [1, 2] })))

    await expect(createHttpClient(BASE).get('')).resolves.toEqual({ content: [1, 2] })
  })

  it.each([400, 500])('turns status %i into an http ApiError with the status', async (status) => {
    server.use(http.get(BASE, () => new HttpResponse(null, { status })))

    const error = await catchError(createHttpClient(BASE).get(''))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'http', status })
  })

  it('turns a failed fetch into a network ApiError without status', async () => {
    server.use(http.get(BASE, () => HttpResponse.error()))

    const error = await catchError(createHttpClient(BASE).get(''))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'network' })
    expect((error as ApiError).status).toBeUndefined()
  })

  it('turns a 200 response that is not JSON into a parse ApiError', async () => {
    server.use(http.get(BASE, () => new HttpResponse('<html></html>', { status: 200 })))

    const error = await catchError(createHttpClient(BASE).get(''))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'parse' })
    expect((error as ApiError).status).toBeUndefined()
  })

  it('lets an abort propagate without converting it', async () => {
    server.use(http.get(BASE, () => HttpResponse.json({})))
    const controller = new AbortController()
    controller.abort()

    const error = await catchError(createHttpClient(BASE).get('', { signal: controller.signal }))

    expect(error).not.toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ name: 'AbortError' })
  })
})
