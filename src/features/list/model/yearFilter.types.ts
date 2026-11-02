export type YearInput =
  { kind: 'empty' } | { kind: 'partial' } | { kind: 'valid'; year: string } | { kind: 'invalid' }
