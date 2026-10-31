import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  title: string
  nav: ReactNode
  children: ReactNode
}

export function AppShell({ title, nav, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>{title}</header>
      <div className={styles.menu}>{nav}</div>
      <main className={styles.content}>{children}</main>
    </div>
  )
}
