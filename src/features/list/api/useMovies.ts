import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MoviesQuery } from '../model/movies.types'
import { fetchMovies } from './moviesApi'
import { moviesKeys } from './moviesKeys'

// keepPreviousData mantém a lista anterior visível enquanto a nova página carrega.
export function useMovies(query: MoviesQuery) {
  return useQuery({
    queryKey: moviesKeys.list(query),
    queryFn: ({ signal }) => fetchMovies(query, signal),
    placeholderData: keepPreviousData,
  })
}
