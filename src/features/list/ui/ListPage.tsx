import { Pagination } from '../../../shared/ui/Pagination/Pagination'
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
  const { data } = useMovies(query)

  return (
    <>
      <h1>List movies</h1>
      <div className={styles.card}>
        <DataTable
          caption="Movies"
          columns={columns}
          rows={data?.movies ?? []}
          getRowKey={(movie) => movie.id}
        />
        {data !== undefined && data.totalPages > 0 && (
          <Pagination page={query.page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </div>
    </>
  )
}
