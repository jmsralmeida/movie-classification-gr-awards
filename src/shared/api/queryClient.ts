import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './apiError'

const FIVE_MINUTES_MS = 5 * 60 * 1000
const MAX_RETRIES = 1

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.kind === 'http' && error.status !== undefined) {
    if (error.status >= 400 && error.status < 500) return false
  }
  return failureCount <= MAX_RETRIES - 1
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES_MS,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  })
}

export const queryClient = createQueryClient()
