import { useQuery } from '@tanstack/react-query'
import type { StudioWinCount } from '../model/dashboard.types'
import { selectTopStudios } from '../model/mappers'
import {
  fetchProducerIntervals,
  fetchStudios,
  fetchWinnersByYear,
  fetchYearsWithMultipleWinners,
} from './dashboardApi'
import { dashboardKeys } from './dashboardKeys'

export function useYearsWithMultipleWinners() {
  return useQuery({
    queryKey: dashboardKeys.yearsWithMultipleWinners,
    queryFn: ({ signal }) => fetchYearsWithMultipleWinners(signal),
  })
}

const TOP_STUDIOS_COUNT = 3

// Função de módulo estável: o `select` não é recriado a cada render.
const selectTopThree = (studios: StudioWinCount[]) => selectTopStudios(studios, TOP_STUDIOS_COUNT)

export function useTopStudios() {
  return useQuery({
    queryKey: dashboardKeys.studios,
    queryFn: ({ signal }) => fetchStudios(signal),
    select: selectTopThree,
  })
}

export function useProducerIntervals() {
  return useQuery({
    queryKey: dashboardKeys.producerIntervals,
    queryFn: ({ signal }) => fetchProducerIntervals(signal),
  })
}

export function useWinnersByYear(year: string | undefined) {
  return useQuery({
    // A chave com '' só existe para satisfazer o tipo: sem ano a consulta fica desligada.
    queryKey: dashboardKeys.winnersByYear(year ?? ''),
    queryFn: ({ signal }) => fetchWinnersByYear(year ?? '', signal),
    enabled: year !== undefined,
  })
}
