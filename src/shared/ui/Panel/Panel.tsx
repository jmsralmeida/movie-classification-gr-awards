import { useId } from 'react'
import type { PanelProps } from './Panel.types'
import styles from './Panel.module.css'

export function Panel({ title, status, emptyMessage, onRetry, controls, children }: PanelProps) {
  const titleId = useId()

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {controls}
      {status === 'loading' && <p role="status">Loading…</p>}
      {status === 'error' && (
        <div className={styles.error}>
          <p role="alert">Could not load this data.</p>
          <button type="button" className={styles.button} onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
      {status === 'empty' && <p>{emptyMessage}</p>}
      {status === 'success' && children}
    </section>
  )
}
