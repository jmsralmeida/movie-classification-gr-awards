import { Pagination } from '../../../shared/ui/Pagination/Pagination'
import { getPanelStatus } from '../../../shared/ui/Panel/panelStatus'
import { StatusMessage } from '../../../shared/ui/StatusMessage/StatusMessage'
import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
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
  const status = getPanelStatus(movies, data?.movies.length === 0)
  const frameClassName = movies.isPlaceholderData ? `${styles.frame} ${styles.busy}` : styles.frame

  return (
    <>
      <h1>List movies</h1>
      <div className={styles.card}>
        {/* A paginação fica fora do wrapper ocupado, para não marcar como ocupada a região do foco. */}
        <div className={frameClassName} aria-busy={movies.isPlaceholderData}>
          <DataTable
            caption="Movies"
            columns={columns}
            rows={data?.movies ?? []}
            getRowKey={(movie) => movie.id}
            statusRow={
              status === 'success' ? undefined : (
                <StatusMessage
                  status={status}
                  emptyMessage="No movies found."
                  onRetry={() => void movies.refetch()}
                />
              )
            }
          />
        </div>
        {data !== undefined && data.totalPages > 0 && (
          <Pagination page={query.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </>
  )
}
