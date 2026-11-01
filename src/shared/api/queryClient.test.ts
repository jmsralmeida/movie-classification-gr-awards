import { describe, expect, it } from 'vitest'
import { ApiError } from './apiError'
import { createQueryClient } from './queryClient'

type RetryFn = (failureCount: number, error: Error) => boolean

function getQueryDefaults() {
  const defaults = createQueryClient().getDefaultOptions().queries
  if (!defaults) throw new Error('Missing query defaults')
  return defaults
}

function getRetry(): RetryFn {
  const { retry } = getQueryDefaults()
  if (typeof retry !== 'function') throw new Error('retry must be a function')
  return retry
}

describe('createQueryClient', () => {
  it('uses a 5 minute stale time and does not refetch on window focus', () => {
    const defaults = getQueryDefaults()

    expect(defaults.staleTime).toBe(5 * 60 * 1000)
    expect(defaults.refetchOnWindowFocus).toBe(false)
  })

  it('never retries a 4xx http error', () => {
    expect(getRetry()(0, new ApiError('http', 'Not found', 404))).toBe(false)
  })

  it('retries a 5xx http error once', () => {
    const retry = getRetry()
    const error = new ApiError('http', 'Server error', 500)

    expect(retry(0, error)).toBe(true)
    expect(retry(1, error)).toBe(false)
  })

  it('retries a network error once', () => {
    const retry = getRetry()
    const error = new ApiError('network', 'Network request failed')

    expect(retry(0, error)).toBe(true)
    expect(retry(1, error)).toBe(false)
  })
})
