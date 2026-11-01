import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../shared/api/apiError'
import {
  emptyStudiosResponse,
  emptyYearsResponse,
  studiosResponse,
  yearsResponse,
} from '../testing/fixtures'
import { mapStudios, mapYearsWithMultipleWinners, selectTopStudios } from './mappers'

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
