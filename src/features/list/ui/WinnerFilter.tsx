import { useId } from 'react'
import { useListParams } from './useListParams'

const ANY = ''

function toValue(winner: boolean | undefined): string {
  return winner === undefined ? ANY : String(winner)
}

function fromValue(value: string): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export function WinnerFilter() {
  const id = useId()
  const { query, setWinner } = useListParams()

  return (
    <>
      <label htmlFor={id} className="visually-hidden">
        Filter by winner
      </label>
      <select
        id={id}
        value={toValue(query.winner)}
        onChange={(event) => setWinner(fromValue(event.target.value))}
      >
        <option value={ANY}>Yes/No</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </>
  )
}
