import { useSearchParams } from 'react-router'
import type { MoviesQuery } from '../model/movies.types'
import { parseMoviesQuery, toSearchParams } from '../model/moviesQuery'

interface ListParams {
  query: MoviesQuery
  setPage: (page: number) => void
}

// A URL é a única fonte de verdade: a query é derivada dela no render.
export function useListParams(): ListParams {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = parseMoviesQuery(searchParams)

  return {
    query,
    setPage: (page) => setSearchParams(toSearchParams({ ...query, page })),
  }
}
