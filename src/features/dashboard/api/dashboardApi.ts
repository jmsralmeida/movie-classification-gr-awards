import { httpClient } from '../../../shared/api/httpClient'
import type { YearWinCount } from '../model/dashboard.types'
import { mapYearsWithMultipleWinners } from '../model/mappers'

export async function fetchYearsWithMultipleWinners(signal?: AbortSignal): Promise<YearWinCount[]> {
  return mapYearsWithMultipleWinners(await httpClient.get('/yearsWithMultipleWinners', { signal }))
}
