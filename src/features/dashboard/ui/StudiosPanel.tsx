import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
import { Panel } from '../../../shared/ui/Panel/Panel'
import { getPanelStatus } from '../../../shared/ui/Panel/panelStatus'
import { useTopStudios } from '../api/useDashboardQueries'
import type { StudioWinCount } from '../model/dashboard.types'

const columns: Column<StudioWinCount>[] = [
  { id: 'name', header: 'Name', render: (row) => row.name },
  { id: 'winCount', header: 'Win Count', render: (row) => row.winCount },
]

export function StudiosPanel() {
  const query = useTopStudios()

  return (
    <Panel
      title="Top 3 studios with winners"
      status={getPanelStatus(query, query.data?.length === 0)}
      emptyMessage="No studios found."
      onRetry={() => void query.refetch()}
    >
      <DataTable
        caption="Top 3 studios by wins"
        columns={columns}
        rows={query.data ?? []}
        getRowKey={(row) => row.name}
      />
    </Panel>
  )
}
