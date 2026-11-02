import { Pagination } from '../../../shared/ui/Pagination/Pagination'
import { getPanelStatus } from '../../../shared/ui/Panel/panelStatus'
import { StatusMessage } from '../../../shared/ui/StatusMessage/StatusMessage'
import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
import { useLastKnownTotalPages } from '../api/useLastKnownTotalPages'
import { useMovies } from '../api/useMovies'
import type { Movie } from '../model/movies.types'
import { WinnerFilter } from './WinnerFilter'
import { YearFilter } from './YearFilter'
import styles from './ListPage.module.css'
import { useListParams } from './useListParams'

const columns: Column<Movie>[] = [
  { id: 'id', header: 'ID', render: (movie) => movie.id },
  {
    id: 'year',
    header: 'Year',
    render: (movie) => movie.year,
    headerControl: <YearFilter />,
  },
  { id: 'title', header: 'Title', render: (movie) => movie.title },
  {
    id: 'winner',
    header: 'Winner?',
    render: (movie) => (movie.winner ? 'Yes' : 'No'),
    headerControl: <WinnerFilter />,
  },
]

export function ListPage() {
  const { query, setPage } = useListParams()
  const movies = useMovies(query)
  const { data } = movies
  // Uma nova tentativa depois de falha volta a `pending` (sem dado em cache): continua no erro,
  // com o botão montado, para o foco não se perder.
  const isErrored = movies.isError || (movies.isPending && movies.errorUpdatedAt > 0)
  const isRetrying = isErrored && movies.isFetching
  const status = getPanelStatus(
    { isError: isErrored, isPending: movies.isPending },
    data?.movies.length === 0,
  )
  const lastKnownTotalPages = useLastKnownTotalPages()
  // No erro sem dado, a paginação usa o último total conhecido: trocar de página ou filtro segue possível.
  const totalPages = data?.totalPages ?? (status === 'error' ? lastKnownTotalPages : undefined)

  return (
    <>
      <h1>List movies</h1>
      <div className={styles.card}>
        {/* aria-busy fica só no tbody (DataTable): filtros e paginação, onde está o foco, ficam fora. */}
        <div className={styles.frame}>
          <DataTable
            caption="Movies"
            columns={columns}
            rows={data?.movies ?? []}
            getRowKey={(movie) => movie.id}
            busy={movies.isPlaceholderData || isRetrying}
            statusRow={
              status === 'success' ? undefined : (
                <StatusMessage
                  status={status}
                  emptyMessage="No movies found."
                  onRetry={() => void movies.refetch()}
                  retrying={isRetrying}
                />
              )
            }
          />
        </div>
        {totalPages !== undefined && totalPages > 0 && (
          <Pagination page={query.page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </>
  )
}
