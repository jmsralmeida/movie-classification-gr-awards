import type { NavItem } from '../shared/ui/NavMenu/NavMenu.types'

export const paths = {
  dashboard: '/dashboard',
  list: '/list',
} as const

export const navItems: NavItem[] = [
  { to: paths.dashboard, label: 'Dashboard' },
  { to: paths.list, label: 'List' },
]
