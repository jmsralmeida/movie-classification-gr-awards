import { httpClient } from '../../../shared/api/httpClient'
import type { StudioWinCount, YearWinCount } from '../model/dashboard.types'
import { mapStudios, mapYearsWithMultipleWinners } from '../model/mappers'

export async function fetchYearsWithMultipleWinners(signal?: AbortSignal): Promise<YearWinCount[]> {
  return mapYearsWithMultipleWinners(await httpClient.get('/yearsWithMultipleWinners', { signal }))
}

// Lista completa; o corte do top 3 é feito na exibição.
export async function fetchStudios(signal?: AbortSignal): Promise<StudioWinCount[]> {
  return mapStudios(await httpClient.get('/studiosWithWinCount', { signal }))
}
