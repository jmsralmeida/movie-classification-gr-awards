import { useId } from 'react'
import type { PanelProps } from './Panel.types'
import { StatusMessage } from '../StatusMessage/StatusMessage'
import styles from './Panel.module.css'

export function Panel({ title, status, emptyMessage, onRetry, controls, children }: PanelProps) {
  const titleId = useId()

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {controls}
      {status !== 'success' && (
        <StatusMessage status={status} emptyMessage={emptyMessage} onRetry={onRetry} />
      )}
      {status === 'success' && children}
    </section>
  )
}
