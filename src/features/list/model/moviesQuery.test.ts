import { describe, expect, it } from 'vitest'
import { MAX_PAGE, PAGE_SIZE, parseMoviesQuery, toApiParams, toSearchParams } from './moviesQuery'

const parse = (search: string) => parseMoviesQuery(new URLSearchParams(search))

describe('parseMoviesQuery', () => {
  it('returns the default state for a URL without parameters', () => {
    expect(parse('')).toEqual({ page: 1, year: undefined, winner: undefined })
  })

  it.each([
    ['1', 1],
    ['2', 2],
    [String(MAX_PAGE), MAX_PAGE],
  ])('accepts page=%s', (raw, expected) => {
    expect(parse(`page=${raw}`).page).toBe(expected)
  })

  it.each(['0', '-1', '1.5', 'abc', '', String(MAX_PAGE + 1), '01'])(
    'falls back to page 1 for page=%j',
    (raw) => {
      expect(parse(`page=${raw}`).page).toBe(1)
    },
  )

  it('accepts a 4-digit year', () => {
    expect(parse('year=1999').year).toBe('1999')
  })

  it.each(['99', 'abc', '19999', ''])('ignores year=%j', (raw) => {
    expect(parse(`year=${raw}`).year).toBeUndefined()
  })

  it.each([
    ['true', true],
    ['false', false],
  ])('accepts winner=%s', (raw, expected) => {
    expect(parse(`winner=${raw}`).winner).toBe(expected)
  })

  it.each(['maybe', 'TRUE', ''])('ignores winner=%j', (raw) => {
    expect(parse(`winner=${raw}`).winner).toBeUndefined()
  })

  it('combines valid parameters and drops only the invalid ones', () => {
    expect(parse('page=2&year=1981&winner=false')).toEqual({
      page: 2,
      year: '1981',
      winner: false,
    })
    expect(parse('page=2&year=abc&winner=maybe')).toEqual({
      page: 2,
      year: undefined,
      winner: undefined,
    })
  })
})

describe('toSearchParams', () => {
  it('omits the defaults, so the default state is a URL without parameters', () => {
    expect(toSearchParams({ page: 1 }).toString()).toBe('')
    expect(toSearchParams({ page: 1, year: undefined, winner: undefined }).toString()).toBe('')
  })

  it('writes only what differs from the default', () => {
    expect(toSearchParams({ page: 3 }).toString()).toBe('page=3')
    expect(toSearchParams({ page: 1, year: '1980', winner: true }).toString()).toBe(
      'year=1980&winner=true',
    )
    expect(toSearchParams({ page: 2, year: '1981', winner: false }).toString()).toBe(
      'page=2&year=1981&winner=false',
    )
  })
})

describe('toApiParams', () => {
  it('sends a 0-based page, the fixed size and no filters when there are none', () => {
    expect(toApiParams({ page: 1 })).toEqual({
      page: 0,
      size: PAGE_SIZE,
      year: undefined,
      winner: undefined,
    })
    expect(PAGE_SIZE).toBe(15)
  })

  it('sends the filters that are present', () => {
    expect(toApiParams({ page: 3, year: '1981', winner: false })).toEqual({
      page: 2,
      size: 15,
      year: '1981',
      winner: false,
    })
  })

  it('never produces an invalid page from a parsed URL', () => {
    for (const search of ['page=0', 'page=-5', 'page=abc', 'page=99999999999']) {
      const params = toApiParams(parse(search))
      expect(params.page).toBe(0)
    }
  })
})
