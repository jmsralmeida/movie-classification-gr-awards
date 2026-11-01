import { DataTable } from '../../../shared/ui/DataTable/DataTable'
import type { Column } from '../../../shared/ui/DataTable/DataTable.types'
import { Panel } from '../../../shared/ui/Panel/Panel'
import { getPanelStatus } from '../../../shared/ui/Panel/panelStatus'
import { useProducerIntervals } from '../api/useDashboardQueries'
import type { ProducerInterval } from '../model/dashboard.types'
import styles from './ProducersPanel.module.css'

const columns: Column<ProducerInterval>[] = [
  { id: 'producer', header: 'Producer', render: (row) => row.producer },
  { id: 'interval', header: 'Interval', render: (row) => row.interval },
  { id: 'previousWin', header: 'Previous Year', render: (row) => row.previousWin },
  { id: 'followingWin', header: 'Following Year', render: (row) => row.followingWin },
]

function getRowKey(row: ProducerInterval): string {
  return `${row.producer}-${row.previousWin}-${row.followingWin}`
}

export function ProducersPanel() {
  const query = useProducerIntervals()
  const isEmpty =
    query.data !== undefined && query.data.max.length === 0 && query.data.min.length === 0

  return (
    <Panel
      title="Producers with longest and shortest interval between wins"
      status={getPanelStatus(query, isEmpty)}
      emptyMessage="No producers with multiple wins."
      onRetry={() => void query.refetch()}
    >
      <section className={styles.group}>
        <h3 className={styles.subtitle}>Maximum</h3>
        <DataTable
          caption="Maximum interval"
          columns={columns}
          rows={query.data?.max ?? []}
          getRowKey={getRowKey}
          emptyMessage="No producers."
        />
      </section>
      <section className={styles.group}>
        <h3 className={styles.subtitle}>Minimum</h3>
        <DataTable
          caption="Minimum interval"
          columns={columns}
          rows={query.data?.min ?? []}
          getRowKey={getRowKey}
          emptyMessage="No producers."
        />
      </section>
    </Panel>
  )
}
