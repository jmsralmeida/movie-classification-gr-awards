import { httpClient } from '../../../shared/api/httpClient'
import { mapMoviesPage } from '../model/mappers'
import type { MoviesPage, MoviesQuery } from '../model/movies.types'
import { toApiParams } from '../model/moviesQuery'

export async function fetchMovies(query: MoviesQuery, signal?: AbortSignal): Promise<MoviesPage> {
  return mapMoviesPage(await httpClient.get('', { params: toApiParams(query), signal }))
}
