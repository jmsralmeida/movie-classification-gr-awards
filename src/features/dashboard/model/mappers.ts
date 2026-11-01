import { expectArray, expectNumber, expectRecord, expectString } from '../../../shared/api/guards'
import type { StudioWinCount, YearWinCount } from './dashboard.types'

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
