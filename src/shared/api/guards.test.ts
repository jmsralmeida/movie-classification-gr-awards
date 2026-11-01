import { describe, expect, it } from 'vitest'
import { ApiError } from './apiError'
import { expectArray, expectNumber, expectRecord, expectString, isRecord } from './guards'

function catchError(fn: () => unknown): unknown {
  try {
    fn()
  } catch (error) {
    return error
  }
  throw new Error('Expected the guard to throw')
}

describe('isRecord', () => {
  it('accepts plain objects', () => {
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord({})).toBe(true)
  })

  it.each([null, undefined, [], 'text', 1])('rejects %j', (value) => {
    expect(isRecord(value)).toBe(false)
  })
})

describe('expect guards', () => {
  it('return the value when the type matches', () => {
    const record = { a: 1 }
    const list = [1]

    expect(expectRecord(record)).toBe(record)
    expect(expectArray(list)).toBe(list)
    expect(expectString('a')).toBe('a')
    expect(expectNumber(2018)).toBe(2018)
  })

  it.each([
    ['expectRecord', expectRecord, null],
    ['expectRecord', expectRecord, undefined],
    ['expectRecord', expectRecord, []],
    ['expectArray', expectArray, {}],
    ['expectArray', expectArray, null],
    ['expectString', expectString, 1],
    ['expectString', expectString, undefined],
    ['expectNumber', expectNumber, '1'],
    ['expectNumber', expectNumber, NaN],
    ['expectNumber', expectNumber, Infinity],
    ['expectNumber', expectNumber, -Infinity],
  ])('%s rejects %j with a parse ApiError', (_name, guard, value) => {
    const error = catchError(() => guard(value))

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ kind: 'parse', message: 'Unexpected response shape' })
  })
})
