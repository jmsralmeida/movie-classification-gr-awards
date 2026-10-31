import type { ReactNode } from 'react'

interface AppShellProps {
  title: string
  nav: ReactNode
  children: ReactNode
}

export function AppShell({ title, nav, children }: AppShellProps) {
  return (
    <>
      <header>{title}</header>
      {nav}
      <main>{children}</main>
    </>
  )
}
