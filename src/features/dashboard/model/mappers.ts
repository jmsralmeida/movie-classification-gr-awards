import { expectArray, expectNumber, expectRecord, expectString } from '../../../shared/api/guards'
import type {
  ProducerInterval,
  ProducerIntervals,
  StudioWinCount,
  WinningMovie,
  YearWinCount,
} from './dashboard.types'

export function mapYearsWithMultipleWinners(raw: unknown): YearWinCount[] {
  return expectArray(expectRecord(raw).years).map((item) => {
    const record = expectRecord(item)
    return { year: expectNumber(record.year), winnerCount: expectNumber(record.winnerCount) }
  })
}

export function mapStudios(raw: unknown): StudioWinCount[] {
  return expectArray(expectRecord(raw).studios).map((item) => {
    const record = expectRecord(item)
    return { name: expectString(record.name), winCount: expectNumber(record.winCount) }
  })
}

// A API já devolve os estúdios em ordem decrescente de vitórias: só corta, sem reordenar.
export function selectTopStudios(studios: StudioWinCount[], count: number): StudioWinCount[] {
  return studios.slice(0, count)
}

function mapProducerInterval(item: unknown): ProducerInterval {
  const record = expectRecord(item)
  return {
    producer: expectString(record.producer),
    interval: expectNumber(record.interval),
    previousWin: expectNumber(record.previousWin),
    followingWin: expectNumber(record.followingWin),
  }
}

export function mapProducerIntervals(raw: unknown): ProducerIntervals {
  const record = expectRecord(raw)
  return {
    max: expectArray(record.max).map(mapProducerInterval),
    min: expectArray(record.min).map(mapProducerInterval),
  }
}

// A resposta é uma lista de filmes (o PDF mostrava um objeto; vale o OpenAPI).
export function mapWinningMovies(raw: unknown): WinningMovie[] {
  return expectArray(raw).map((item) => {
    const record = expectRecord(item)
    return {
      id: expectNumber(record.id),
      year: expectNumber(record.year),
      title: expectString(record.title),
    }
  })
}
