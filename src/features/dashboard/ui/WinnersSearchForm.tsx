import { useId, useState, type SubmitEvent } from 'react'
import { useSearchParams } from 'react-router'
import { parseYear } from '../../../shared/lib/year'
import { YEAR_PARAM } from '../model/year'
import styles from './WinnersSearchForm.module.css'

interface WinnersSearchFormProps {
  // Ano da URL; quando muda (busca, voltar/avançar), o campo passa a mostrá-lo.
  year: string | undefined
}

const INVALID_YEAR_MESSAGE = 'Enter a 4-digit year.'

export function WinnersSearchForm({ year }: WinnersSearchFormProps) {
  const [, setSearchParams] = useSearchParams()
  const [hasError, setHasError] = useState(false)
  const [draft, setDraft] = useState(year ?? '')
  const [syncedYear, setSyncedYear] = useState(year)
  const inputId = useId()
  const errorId = useId()

  // Ajuste de estado no render (sem useEffect nem `key`): o form não remonta, então o foco fica.
  if (year !== syncedYear) {
    setSyncedYear(year)
    setDraft(year ?? '')
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const raw = new FormData(event.currentTarget).get(YEAR_PARAM)
    const parsed = parseYear(typeof raw === 'string' ? raw : null)

    if (parsed === undefined) {
      setHasError(true)
      return
    }
    setHasError(false)
    if (parsed !== year) setSearchParams({ [YEAR_PARAM]: parsed })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <label htmlFor={inputId} className="visually-hidden">
          Search by year
        </label>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="numeric"
          name={YEAR_PARAM}
          placeholder="Search by year"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
        <button type="submit" className={styles.button} aria-label="Search">
          <svg
            aria-hidden="true"
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
        </button>
      </div>
      {hasError && (
        <p id={errorId} className={styles.error} role="alert">
          {INVALID_YEAR_MESSAGE}
        </p>
      )}
    </form>
  )
}
