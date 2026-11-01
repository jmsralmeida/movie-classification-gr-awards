import { httpClient } from '../../../shared/api/httpClient'
import type { ProducerIntervals, StudioWinCount, YearWinCount } from '../model/dashboard.types'
import { mapProducerIntervals, mapStudios, mapYearsWithMultipleWinners } from '../model/mappers'

export async function fetchYearsWithMultipleWinners(signal?: AbortSignal): Promise<YearWinCount[]> {
  return mapYearsWithMultipleWinners(await httpClient.get('/yearsWithMultipleWinners', { signal }))
}

// Lista completa; o corte do top 3 é feito na exibição.
export async function fetchStudios(signal?: AbortSignal): Promise<StudioWinCount[]> {
  return mapStudios(await httpClient.get('/studiosWithWinCount', { signal }))
}

export async function fetchProducerIntervals(signal?: AbortSignal): Promise<ProducerIntervals> {
  return mapProducerIntervals(await httpClient.get('/maxMinWinIntervalForProducers', { signal }))
}
