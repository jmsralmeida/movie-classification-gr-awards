import type { PaginationProps } from './Pagination.types'
import { getPageWindow } from './pageWindow'
import styles from './Pagination.module.css'

interface JumpButtonProps {
  label: string
  glyph: string
  // undefined = sem destino.
  target: number | undefined
  onPageChange: (page: number) => void
}

// Sem destino usa aria-disabled (e não disabled) para o botão focado manter o foco.
function JumpButton({ label, glyph, target, onPageChange }: JumpButtonProps) {
  return (
    <li>
      <button
        type="button"
        className={styles.button}
        aria-label={label}
        aria-disabled={target === undefined ? 'true' : undefined}
        onClick={target === undefined ? undefined : () => onPageChange(target)}
      >
        <span aria-hidden="true">{glyph}</span>
      </button>
    </li>
  )
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const hasPrevious = page > 1
  const hasNext = page < totalPages
  // Além do total, "Last page" ainda leva de volta a uma página válida.
  const canJumpToLast = page !== totalPages

  return (
    <nav aria-label="Pagination" className={styles.nav}>
      <ul className={styles.list}>
        <JumpButton
          label="First page"
          glyph="«"
          target={hasPrevious ? 1 : undefined}
          onPageChange={onPageChange}
        />
        <JumpButton
          label="Previous page"
          glyph="‹"
          target={hasPrevious ? Math.min(page - 1, totalPages) : undefined}
          onPageChange={onPageChange}
        />
        {getPageWindow(page, totalPages).map((number) => (
          <li key={number}>
            <button
              type="button"
              className={styles.button}
              aria-label={`Page ${number}`}
              aria-current={number === page ? 'page' : undefined}
              onClick={() => onPageChange(number)}
            >
              {number}
            </button>
          </li>
        ))}
        <JumpButton
          label="Next page"
          glyph="›"
          target={hasNext ? page + 1 : undefined}
          onPageChange={onPageChange}
        />
        <JumpButton
          label="Last page"
          glyph="»"
          target={canJumpToLast ? totalPages : undefined}
          onPageChange={onPageChange}
        />
      </ul>
    </nav>
  )
}
