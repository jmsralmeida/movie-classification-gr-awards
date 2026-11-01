import { describe, expect, it } from 'vitest'
import { classifyYearInput } from './yearFilter'

describe('classifyYearInput', () => {
  it.each(['', '   '])('classifies %j as empty', (draft) => {
    expect(classifyYearInput(draft)).toEqual({ kind: 'empty' })
  })

  it.each(['1', '19', '199'])('classifies %j as partial', (draft) => {
    expect(classifyYearInput(draft)).toEqual({ kind: 'partial' })
  })

  it.each(['1999', ' 1999 '])('classifies %j as a valid year', (draft) => {
    expect(classifyYearInput(draft)).toEqual({ kind: 'valid', year: '1999' })
  })

  it.each(['abc', '19a9', '19.9', '-199', '19999', '+1999', '１９９９'])(
    'classifies %j as invalid',
    (draft) => {
      expect(classifyYearInput(draft)).toEqual({ kind: 'invalid' })
    },
  )
})
