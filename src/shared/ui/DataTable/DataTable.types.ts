import type { ReactNode } from 'react'

export interface Column<T> {
  id: string
  header: string
  render: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  // Nome acessível da tabela; oculto visualmente.
  caption: string
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  // Linha única com colSpan quando rows está vazio.
  emptyMessage?: string
}
