import { parseYear } from '../../../shared/lib/year'
import type { YearInput } from './yearFilter.types'

// Só ASCII (sem a flag `u`), como em parseYear.
const PARTIAL_YEAR_PATTERN = /^\d{1,3}$/

export function classifyYearInput(draft: string): YearInput {
  const trimmed = draft.trim()
  if (trimmed === '') return { kind: 'empty' }
  const year = parseYear(trimmed)
  if (year !== undefined) return { kind: 'valid', year }
  if (PARTIAL_YEAR_PATTERN.test(trimmed)) return { kind: 'partial' }
  return { kind: 'invalid' }
}
