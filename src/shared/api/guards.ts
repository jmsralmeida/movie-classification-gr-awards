import { ApiError } from './apiError'

const UNEXPECTED_SHAPE = 'Unexpected response shape'

function unexpectedShape(): ApiError {
  return new ApiError('parse', UNEXPECTED_SHAPE)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function expectRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw unexpectedShape()
  return value
}

export function expectArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw unexpectedShape()
  return value as unknown[]
}

export function expectString(value: unknown): string {
  if (typeof value !== 'string') throw unexpectedShape()
  return value
}

export function expectNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw unexpectedShape()
  return value
}

export function expectBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw unexpectedShape()
  return value
}
