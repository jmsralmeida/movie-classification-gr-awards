// Só ASCII: \d sem a flag `u` não casa dígitos de outros alfabetos (ex.: largura total).
const YEAR_PATTERN = /^\d{4}$/

export function parseYear(raw: string | null | undefined): string | undefined {
  if (raw === null || raw === undefined) return undefined
  const trimmed = raw.trim()
  return YEAR_PATTERN.test(trimmed) ? trimmed : undefined
}
