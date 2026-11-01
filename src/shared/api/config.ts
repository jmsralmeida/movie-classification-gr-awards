const DEFAULT_API_BASE_URL = 'https://challenge.outsera.tech/api/movies'

export function resolveApiBaseUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? ''
  if (trimmed === '') return DEFAULT_API_BASE_URL
  return trimmed.replace(/\/+$/, '')
}

export const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
