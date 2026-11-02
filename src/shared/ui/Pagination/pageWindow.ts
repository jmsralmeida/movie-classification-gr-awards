export const WINDOW_SIZE = 5

// Até `size` números consecutivos centrados em `page`, deslocados para caber em [1, totalPages].
// Com `page` fora do intervalo (ex.: URL além do total), devolve a janela final.
export function getPageWindow(
  page: number,
  totalPages: number,
  size: number = WINDOW_SIZE,
): number[] {
  const length = Math.min(size, totalPages)
  const lastStart = totalPages - length + 1
  const isInRange = page >= 1 && page <= totalPages
  const centered = page - Math.floor(length / 2)
  const start = isInRange ? Math.min(Math.max(centered, 1), lastStart) : lastStart
  return Array.from({ length }, (_, index) => start + index)
}
