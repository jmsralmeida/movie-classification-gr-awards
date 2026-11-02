import { describe, expect, it } from 'vitest'
import { ApiError } from '../../../shared/api/apiError'
import { mapMoviesPage } from './mappers'

function catchError(fn: () => unknown): unknown {
  try {
    fn()
  } catch (error) {
    return error
  }
  throw new Error('Expected the mapper to throw')
}

const movie = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  year: 1980,
  title: "Can't Stop the Music",
  studios: ['Associated Film Distribution'],
  producers: ['Allan Carr'],
  winner: true,
  ...overrides,
})

describe('mapMoviesPage', () => {
  it('keeps values and order, drops extra fields and returns the total of pages', () => {
    const raw = {
      content: [
        movie(),
        movie({ id: 2, year: 1981, title: 'Cruising', winner: false }),
        movie({ id: 3, year: 1982, title: 'The Formula', winner: false }),
      ],
      totalPages: 14,
      totalElements: 206,
      number: 0,
      size: 15,
    }

    expect(mapMoviesPage(raw)).toEqual({
      movies: [
        { id: 1, year: 1980, title: "Can't Stop the Music", winner: true },
        { id: 2, year: 1981, title: 'Cruising', winner: false },
        { id: 3, year: 1982, title: 'The Formula', winner: false },
      ],
      totalPages: 14,
    })
  })

  it('accepts an empty content list', () => {
    expect(mapMoviesPage({ content: [], totalPages: 0 })).toEqual({ movies: [], totalPages: 0 })
  })

  it.each([
    ['a non-object payload', null],
    ['a non-list content', { content: {}, totalPages: 1 }],
    ['a missing totalPages', { content: [] }],
    ['a string totalPages', { content: [], totalPages: '1' }],
    ['a null item', { content: [null], totalPages: 1 }],
    [
      'an item without a boolean winner',
      { content: [movie({ winner: undefined })], totalPages: 1 },
    ],
    ['a string winner', { content: [movie({ winner: 'true' })], totalPages: 1 }],
    ['an item without a title', { content: [movie({ title: 1 })], totalPages: 1 }],
  ])('rejects %s with a parse ApiError', (_name, raw) => {
    const error = catchError(() => mapMoviesPage(raw))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'parse', message: 'Unexpected response shape' })
  })
})
