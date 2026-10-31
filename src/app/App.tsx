import { Navigate, Route, Routes } from 'react-router'
import { DashboardPage } from '../features/dashboard/ui/DashboardPage'
import { ListPage } from '../features/list/ui/ListPage'
import { AppShell } from '../shared/ui/AppShell/AppShell'
import { NavMenu } from '../shared/ui/NavMenu/NavMenu'
import { navItems, paths } from './navigation'
import { NotFoundPage } from './NotFoundPage'

export function App() {
  return (
    <AppShell title="Outsera Razzies" nav={<NavMenu items={navItems} label="Main" />}>
      <Routes>
        <Route path="/" element={<Navigate to={paths.dashboard} replace />} />
        <Route path={paths.dashboard} element={<DashboardPage />} />
        <Route path={paths.list} element={<ListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  )
}
