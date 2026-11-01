import type { MoviesQuery } from '../model/movies.types'

export const moviesKeys = {
  list: (query: MoviesQuery) =>
    ['list', 'movies', { page: query.page, year: query.year, winner: query.winner }] as const,
}
