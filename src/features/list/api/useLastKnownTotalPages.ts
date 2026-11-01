import { useQueryClient } from '@tanstack/react-query'
import type { MoviesPage } from '../model/movies.types'
import { moviesKeys } from './moviesKeys'

// Total de páginas da resposta mais recente que o cache tem (qualquer página ou filtro), para a
// paginação continuar útil quando a consulta atual falha sem dado. Lido do cache do TanStack
// Query no render, sem estado espelho; `undefined` quando nada foi carregado ainda.
export function useLastKnownTotalPages(): number | undefined {
  const queryClient = useQueryClient()
  let latest: { updatedAt: number; totalPages: number } | undefined

  for (const cached of queryClient.getQueryCache().findAll({ queryKey: moviesKeys.all })) {
    const data = queryClient.getQueryData<MoviesPage>(cached.queryKey)
    if (
      data !== undefined &&
      (latest === undefined || cached.state.dataUpdatedAt > latest.updatedAt)
    ) {
      latest = { updatedAt: cached.state.dataUpdatedAt, totalPages: data.totalPages }
    }
  }
  return latest?.totalPages
}
