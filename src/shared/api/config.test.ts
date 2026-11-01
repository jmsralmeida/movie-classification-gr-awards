import { describe, expect, it } from 'vitest'
import { resolveApiBaseUrl } from './config'

const DEFAULT_URL = 'https://challenge.outsera.tech/api/movies'

describe('resolveApiBaseUrl', () => {
  it('uses the default URL when the value is undefined', () => {
    expect(resolveApiBaseUrl(undefined)).toBe(DEFAULT_URL)
  })

  it.each(['', '   '])('uses the default URL for the blank value %j', (raw) => {
    expect(resolveApiBaseUrl(raw)).toBe(DEFAULT_URL)
  })

  it('uses a custom URL', () => {
    expect(resolveApiBaseUrl('http://localhost:3000/api/movies')).toBe(
      'http://localhost:3000/api/movies',
    )
  })

  it('removes every trailing slash', () => {
    expect(resolveApiBaseUrl('http://localhost:3000/api/movies///')).toBe(
      'http://localhost:3000/api/movies',
    )
  })
})
