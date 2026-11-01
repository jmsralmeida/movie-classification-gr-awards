import { useEffect, useRef } from 'react'
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
  const retryRef = useRef<HTMLButtonElement>(null)

  // Se a falha desmontou o botão focado (ex.: "Next page"), o foco foi ao body: leva-o ao "Try again".
  useEffect(() => {
    if (status === 'error' && document.activeElement === document.body) retryRef.current?.focus()
  }, [status])

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
            busy={movies.isPlaceholderData}
            statusRow={
              status === 'success' ? undefined : (
                <StatusMessage
                  status={status}
                  emptyMessage="No movies found."
                  onRetry={() => void movies.refetch()}
                  retryRef={retryRef}
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
