import type { DataTableProps } from './DataTable.types'
import styles from './DataTable.module.css'

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage,
}: DataTableProps<T>) {
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((column) => (
              <td key={column.id}>{column.render(row)}</td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && emptyMessage !== undefined && (
          <tr>
            <td colSpan={columns.length}>{emptyMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
