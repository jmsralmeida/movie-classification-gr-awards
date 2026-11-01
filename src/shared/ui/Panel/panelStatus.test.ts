import { describe, expect, it } from 'vitest'
import { getPanelStatus } from './panelStatus'

describe('getPanelStatus', () => {
  it.each([
    ['error', { isError: true, isPending: false }, false],
    ['loading', { isError: false, isPending: true }, false],
    ['empty', { isError: false, isPending: false }, true],
    ['success', { isError: false, isPending: false }, false],
  ] as const)('returns %s', (expected, query, isEmpty) => {
    expect(getPanelStatus(query, isEmpty)).toBe(expected)
  })

  it('gives the error priority over pending and empty', () => {
    expect(getPanelStatus({ isError: true, isPending: true }, true)).toBe('error')
  })

  it('gives pending priority over empty', () => {
    expect(getPanelStatus({ isError: false, isPending: true }, true)).toBe('loading')
  })
})
