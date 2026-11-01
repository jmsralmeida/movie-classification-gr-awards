import { ProducersPanel } from './ProducersPanel'
import { StudiosPanel } from './StudiosPanel'
import { WinnersByYearPanel } from './WinnersByYearPanel'
import { YearsPanel } from './YearsPanel'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <div className={styles.columns}>
        <div className={styles.column}>
          <YearsPanel />
          <ProducersPanel />
        </div>
        <div className={styles.column}>
          <StudiosPanel />
          <WinnersByYearPanel />
        </div>
      </div>
    </>
  )
}
