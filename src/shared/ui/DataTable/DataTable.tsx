import type { DataTableProps } from './DataTable.types'
import styles from './DataTable.module.css'

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage,
  statusRow,
  busy,
}: DataTableProps<T>) {
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} scope="col">
              {column.header}
              {column.headerControl !== undefined && (
                <div className={styles.headerControl}>{column.headerControl}</div>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody aria-busy={busy}>
        {statusRow !== undefined && (
          <tr>
            <td colSpan={columns.length}>{statusRow}</td>
          </tr>
        )}
        {statusRow === undefined &&
          rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => (
                <td key={column.id}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        {statusRow === undefined && rows.length === 0 && emptyMessage !== undefined && (
          <tr>
            <td colSpan={columns.length}>{emptyMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
