import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
import { useMovies } from '../api/useMovies'
import type { Movie } from '../model/movies.types'
import styles from './ListPage.module.css'
import { useListParams } from './useListParams'

const columns: Column<Movie>[] = [
  { id: 'id', header: 'ID', render: (movie) => movie.id },
  { id: 'year', header: 'Year', render: (movie) => movie.year },
  { id: 'title', header: 'Title', render: (movie) => movie.title },
  { id: 'winner', header: 'Winner?', render: (movie) => (movie.winner ? 'Yes' : 'No') },
]

export function ListPage() {
  const { query } = useListParams()
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
      </div>
    </>
  )
}
