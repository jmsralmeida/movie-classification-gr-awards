import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../shared/api/apiError'
import {
  emptyIntervalsResponse,
  emptyStudiosResponse,
  emptyWinnersResponse,
  emptyYearsResponse,
  intervalsOnlyMaxResponse,
  intervalsResponse,
  intervalsWithTiesResponse,
  studiosResponse,
  winnersByYear2018Response,
  winnersWithTiesResponse,
  yearsResponse,
} from '../testing/fixtures'
import {
  mapProducerIntervals,
  mapStudios,
  mapWinningMovies,
  mapYearsWithMultipleWinners,
  selectTopStudios,
} from './mappers'

function catchError(fn: () => unknown): unknown {
  try {
    fn()
  } catch (error) {
    return error
  }
  throw new Error('Expected the mapper to throw')
}

function expectParseError(fn: () => unknown) {
  const error = catchError(fn)
  expect(error).toBeInstanceOf(ApiError)
  expect(error).toMatchObject({ kind: 'parse', message: 'Unexpected response shape' })
}

describe('mapYearsWithMultipleWinners', () => {
  it('returns the years and counts as sent by the API, in the same order', () => {
    expect(mapYearsWithMultipleWinners(yearsResponse)).toEqual(yearsResponse.years)
  })

  it('accepts an empty list', () => {
    expect(mapYearsWithMultipleWinners(emptyYearsResponse)).toEqual([])
  })

  it('ignores extra fields', () => {
    const raw = { years: [{ year: 1986, winnerCount: 2, extra: 'x' }], other: 1 }

    expect(mapYearsWithMultipleWinners(raw)).toEqual([{ year: 1986, winnerCount: 2 }])
  })

  it.each([
    ['not an object', []],
    ['missing years', {}],
    ['years is not a list', { years: {} }],
    ['year as string', { years: [{ year: '1986', winnerCount: 2 }] }],
    ['missing winnerCount', { years: [{ year: 1986 }] }],
    ['null item', { years: [null] }],
  ])('throws a parse ApiError for %s', (_name, raw) => {
    expectParseError(() => mapYearsWithMultipleWinners(raw))
  })
})

describe('mapStudios', () => {
  it('returns the full list as sent by the API, in the same order', () => {
    expect(mapStudios(studiosResponse)).toEqual(studiosResponse.studios)
  })

  it('accepts an empty list', () => {
    expect(mapStudios(emptyStudiosResponse)).toEqual([])
  })

  it.each([
    ['not an object', null],
    ['missing studios', {}],
    ['name as number', { studios: [{ name: 1, winCount: 2 }] }],
    ['missing winCount', { studios: [{ name: 'MGM' }] }],
    ['null item', { studios: [null] }],
  ])('throws a parse ApiError for %s', (_name, raw) => {
    expectParseError(() => mapStudios(raw))
  })
})

describe('selectTopStudios', () => {
  const studios = mapStudios(studiosResponse)

  it('returns the first three in the API order', () => {
    expect(selectTopStudios(studios, 3).map((studio) => studio.name)).toEqual([
      'Columbia Pictures',
      'Paramount Pictures',
      'Warner Bros.',
    ])
  })

  it('returns all of them when there are fewer than three', () => {
    expect(selectTopStudios(studios.slice(0, 2), 3)).toHaveLength(2)
  })

  it('returns an empty list for an empty list', () => {
    expect(selectTopStudios([], 3)).toEqual([])
  })
})

describe('mapProducerIntervals', () => {
  it('returns max and min as sent by the API', () => {
    expect(mapProducerIntervals(intervalsResponse)).toEqual(intervalsResponse)
  })

  it('preserves every tied item in both groups', () => {
    const result = mapProducerIntervals(intervalsWithTiesResponse)

    expect(result.max.map((item) => item.producer)).toEqual(['Matthew Vaughn', 'Another Producer'])
    expect(result.min.map((item) => item.producer)).toEqual(['Joel Silver', 'Bo Derek'])
  })

  it('accepts an empty min or max, or both', () => {
    expect(mapProducerIntervals(intervalsOnlyMaxResponse).min).toEqual([])
    expect(mapProducerIntervals(emptyIntervalsResponse)).toEqual({ max: [], min: [] })
  })

  it('ignores extra fields', () => {
    const raw = {
      max: [{ ...intervalsResponse.max[0], extra: true }],
      min: [],
    }

    expect(mapProducerIntervals(raw).max).toEqual(intervalsResponse.max)
  })

  it.each([
    ['not an object', []],
    ['missing max', { min: [] }],
    ['missing min', { max: [] }],
    ['interval as string', { max: [], min: [{ ...intervalsResponse.min[0], interval: '1' }] }],
    ['missing producer', { max: [{ interval: 1, previousWin: 1, followingWin: 2 }], min: [] }],
    ['null item', { max: [null], min: [] }],
  ])('throws a parse ApiError for %s', (_name, raw) => {
    expectParseError(() => mapProducerIntervals(raw))
  })
})

describe('mapWinningMovies', () => {
  it('keeps only id, year and title', () => {
    expect(mapWinningMovies(winnersByYear2018Response)).toEqual([
      { id: 197, year: 2018, title: 'Holmes & Watson' },
    ])
  })

  it('returns every movie of the year in the API order', () => {
    expect(mapWinningMovies(winnersWithTiesResponse).map((movie) => movie.id)).toEqual([101, 102])
  })

  it('accepts an empty list', () => {
    expect(mapWinningMovies(emptyWinnersResponse)).toEqual([])
  })

  it.each([
    ['an object instead of a list (the PDF format)', { years: [] }],
    ['null', null],
    ['an item without title', [{ id: 1, year: 2018 }]],
    ['a null item', [null]],
    ['id as string', [{ id: '1', year: 2018, title: 'A' }]],
  ])('throws a parse ApiError for %s', (_name, raw) => {
    expectParseError(() => mapWinningMovies(raw))
  })
})
