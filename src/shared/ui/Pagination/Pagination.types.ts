export interface PaginationProps {
  // Atual, base 1; pode estar além de totalPages (URL antiga).
  page: number
  // >= 1.
  totalPages: number
  onPageChange: (page: number) => void
}
