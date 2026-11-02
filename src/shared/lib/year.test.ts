import { describe, expect, it } from 'vitest'
import { parseYear } from './year'

describe('parseYear', () => {
  it.each([
    ['2018', '2018'],
    [' 2018 ', '2018'],
  ])('accepts %j', (raw, expected) => {
    expect(parseYear(raw)).toBe(expected)
  })

  it.each([
    null,
    undefined,
    '',
    '   ',
    'abc',
    '20a8',
    '2018.5',
    '-2018',
    '201',
    '20180',
    '+2018',
    '２０１８',
  ])('treats %j as no year', (raw) => {
    expect(parseYear(raw)).toBeUndefined()
  })
})
