import { useQuery } from '@tanstack/react-query'
import { fetchYearsWithMultipleWinners } from './dashboardApi'
import { dashboardKeys } from './dashboardKeys'

export function useYearsWithMultipleWinners() {
  return useQuery({
    queryKey: dashboardKeys.yearsWithMultipleWinners,
    queryFn: ({ signal }) => fetchYearsWithMultipleWinners(signal),
  })
}
