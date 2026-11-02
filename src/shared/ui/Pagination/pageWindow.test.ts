import { describe, expect, it } from 'vitest'
import { getPageWindow } from './pageWindow'

describe('getPageWindow', () => {
  it.each([
    [1, 14, [1, 2, 3, 4, 5]],
    [2, 14, [1, 2, 3, 4, 5]],
    [7, 14, [5, 6, 7, 8, 9]],
    [14, 14, [10, 11, 12, 13, 14]],
    [1, 3, [1, 2, 3]],
    [1, 1, [1]],
    [99, 14, [10, 11, 12, 13, 14]],
  ])('page %i of %i gives %j', (page, totalPages, expected) => {
    expect(getPageWindow(page, totalPages)).toEqual(expected)
  })

  it('respects a custom size', () => {
    expect(getPageWindow(5, 10, 3)).toEqual([4, 5, 6])
  })
})
