import type { MoviesQuery } from '../model/movies.types'

export const moviesKeys = {
  all: ['list', 'movies'] as const,
  list: (query: MoviesQuery) =>
    [...moviesKeys.all, { page: query.page, year: query.year, winner: query.winner }] as const,
}
