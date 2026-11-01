import {
  expectArray,
  expectBoolean,
  expectNumber,
  expectRecord,
  expectString,
} from '../../../shared/api/guards'
import type { Movie, MoviesPage } from './movies.types'

function mapMovie(item: unknown): Movie {
  const record = expectRecord(item)
  return {
    id: expectNumber(record.id),
    year: expectNumber(record.year),
    title: expectString(record.title),
    winner: expectBoolean(record.winner),
  }
}

// Só o que a tela usa; filtros, ordem e paginação são da API.
export function mapMoviesPage(raw: unknown): MoviesPage {
  const record = expectRecord(raw)
  return {
    movies: expectArray(record.content).map(mapMovie),
    totalPages: expectNumber(record.totalPages),
  }
}
