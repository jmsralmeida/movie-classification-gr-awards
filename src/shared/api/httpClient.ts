import { ApiError } from './apiError'
import { apiBaseUrl } from './config'
import type { HttpClient, QueryParams, RequestOptions } from './httpClient.types'

function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  return `${baseUrl}${path}${query === '' ? '' : `?${query}`}`
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function createHttpClient(baseUrl: string): HttpClient {
  const normalizedBase = baseUrl.replace(/\/+$/, '')

  return {
    async get(path: string, { params, signal }: RequestOptions = {}): Promise<unknown> {
      const url = buildUrl(normalizedBase, path, params)

      let response: Response
      try {
        response = await fetch(url, { signal })
      } catch (error) {
        if (isAbortError(error)) throw error
        throw new ApiError('network', 'Network request failed')
      }

      if (!response.ok) {
        throw new ApiError('http', `Request failed with status ${response.status}`, response.status)
      }

      try {
        return (await response.json()) as unknown
      } catch (error) {
        if (isAbortError(error)) throw error
        throw new ApiError('parse', 'Response is not valid JSON')
      }
    },
  }
}

export const httpClient = createHttpClient(apiBaseUrl)
