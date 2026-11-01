import type { StatusMessageProps } from './StatusMessage.types'
import styles from './StatusMessage.module.css'

export function StatusMessage({ status, emptyMessage, onRetry, retryRef }: StatusMessageProps) {
  if (status === 'loading') return <p role="status">Loading…</p>
  if (status === 'empty') return <p>{emptyMessage}</p>

  return (
    <div className={styles.error}>
      <p role="alert">Could not load this data.</p>
      <button type="button" ref={retryRef} className={styles.button} onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}
