import { useSearchParams } from 'react-router'
import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
import { Panel } from '../../../shared/ui/Panel/Panel'
import { getPanelStatus } from '../../../shared/ui/Panel/panelStatus'
import { useWinnersByYear } from '../api/useDashboardQueries'
import type { WinningMovie } from '../model/dashboard.types'
import { parseYear } from '../../../shared/lib/year'
import { YEAR_PARAM } from '../model/year'
import { WinnersSearchForm } from './WinnersSearchForm'

const columns: Column<WinningMovie>[] = [
  { id: 'id', header: 'Id', render: (row) => row.id },
  { id: 'year', header: 'Year', render: (row) => row.year },
  { id: 'title', header: 'Title', render: (row) => row.title },
]

const TABLE_CAPTION = 'Winners of the selected year'
const INITIAL_MESSAGE = 'Enter a year (e.g. 2018) to see its winners.'

export function WinnersByYearPanel() {
  const [searchParams] = useSearchParams()
  // Derivado no render: a URL é a única fonte do ano buscado.
  const year = parseYear(searchParams.get(YEAR_PARAM))
  const query = useWinnersByYear(year)

  const status = year === undefined ? 'success' : getPanelStatus(query, query.data?.length === 0)

  return (
    <Panel
      title="List movie winners by year"
      status={status}
      emptyMessage={`No winners found for ${year ?? ''}.`}
      onRetry={() => void query.refetch()}
      controls={<WinnersSearchForm year={year} />}
    >
      <DataTable
        caption={TABLE_CAPTION}
        columns={columns}
        rows={year === undefined ? [] : (query.data ?? [])}
        getRowKey={(row) => row.id}
        emptyMessage={year === undefined ? INITIAL_MESSAGE : undefined}
      />
    </Panel>
  )
}
