import { parseYear } from '../../../shared/lib/year'
import type { QueryParams } from '../../../shared/api/httpClient.types'
import type { MoviesQuery } from './movies.types'

export const PAGE_SIZE = 15
// Acima disso a API (int32) falharia: valor inválido = página padrão.
export const MAX_PAGE = 1_000_000
export const PAGE_PARAM = 'page'
export const YEAR_PARAM = 'year'
export const WINNER_PARAM = 'winner'

const PAGE_PATTERN = /^[1-9]\d*$/

function parsePage(raw: string | null): number {
  if (raw === null || !PAGE_PATTERN.test(raw)) return 1
  const page = Number(raw)
  return page <= MAX_PAGE ? page : 1
}

function parseWinner(raw: string | null): boolean | undefined {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return undefined
}

export function parseMoviesQuery(searchParams: URLSearchParams): MoviesQuery {
  return {
    page: parsePage(searchParams.get(PAGE_PARAM)),
    year: parseYear(searchParams.get(YEAR_PARAM)),
    winner: parseWinner(searchParams.get(WINNER_PARAM)),
  }
}

// O estado padrão (página 1, sem filtros) gera uma URL sem parâmetros.
export function toSearchParams(query: MoviesQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.page !== 1) params.set(PAGE_PARAM, String(query.page))
  if (query.year !== undefined) params.set(YEAR_PARAM, query.year)
  if (query.winner !== undefined) params.set(WINNER_PARAM, String(query.winner))
  return params
}

// `page` vai em base 0; o httpClient omite os `undefined`.
export function toApiParams(query: MoviesQuery): QueryParams {
  return { page: query.page - 1, size: PAGE_SIZE, year: query.year, winner: query.winner }
}
