import type { ApiErrorKind } from './httpClient.types'

export class ApiError extends Error {
  kind: ApiErrorKind
  // Só existe quando kind é 'http'.
  status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    if (kind === 'http') this.status = status
  }
}
