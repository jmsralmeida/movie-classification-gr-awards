import { useId, useState, type ChangeEvent } from 'react'
import { classifyYearInput } from '../model/yearFilter'
import styles from './YearFilter.module.css'
import { useListParams } from './useListParams'

const LABEL = 'Filter by year'
const INVALID_YEAR_MESSAGE = 'Enter a 4-digit year.'

export function YearFilter() {
  const { query, setYear } = useListParams()
  const [draft, setDraft] = useState(query.year ?? '')
  const [syncedYear, setSyncedYear] = useState(query.year)
  const inputId = useId()
  const errorId = useId()

  // Ajuste de estado no render (sem useEffect nem `key`): o campo não remonta, então o foco fica.
  if (query.year !== syncedYear) {
    setSyncedYear(query.year)
    setDraft(query.year ?? '')
  }

  // Derivado do rascunho no render, sem estado de erro.
  const isInvalid = classifyYearInput(draft).kind === 'invalid'

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    setDraft(next)

    const input = classifyYearInput(next)
    if (input.kind === 'valid' && input.year !== query.year) setYear(input.year)
    if (input.kind === 'empty' && query.year !== undefined) setYear(undefined)
  }

  return (
    <>
      <label htmlFor={inputId} className="visually-hidden">
        {LABEL}
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="text"
        inputMode="numeric"
        placeholder={LABEL}
        value={draft}
        onChange={handleChange}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={isInvalid ? errorId : undefined}
      />
      {isInvalid && (
        <p id={errorId} className={styles.error} role="alert">
          {INVALID_YEAR_MESSAGE}
        </p>
      )}
    </>
  )
}
