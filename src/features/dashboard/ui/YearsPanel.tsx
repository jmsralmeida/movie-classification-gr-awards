import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
import { Panel } from '../../../shared/ui/Panel/Panel'
import { getPanelStatus } from '../../../shared/ui/Panel/panelStatus'
import { useYearsWithMultipleWinners } from '../api/useDashboardQueries'
import type { YearWinCount } from '../model/dashboard.types'

const columns: Column<YearWinCount>[] = [
  { id: 'year', header: 'Year', render: (row) => row.year },
  { id: 'winnerCount', header: 'Win Count', render: (row) => row.winnerCount },
]

export function YearsPanel() {
  const query = useYearsWithMultipleWinners()

  return (
    <Panel
      title="List years with multiple winners"
      status={getPanelStatus(query, query.data?.length === 0)}
      emptyMessage="No years with multiple winners."
      onRetry={() => void query.refetch()}
    >
      <DataTable
        caption="Years with multiple winners"
        columns={columns}
        rows={query.data ?? []}
        getRowKey={(row) => row.year}
      />
    </Panel>
  )
}
