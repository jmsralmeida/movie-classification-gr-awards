import type { ReactNode } from 'react'

export type PanelStatus = 'loading' | 'error' | 'empty' | 'success'

export interface PanelProps {
  title: string
  status: PanelStatus
  emptyMessage: string
  onRetry: () => void
  // Sempre visível (ex.: formulário de busca), em qualquer estado.
  controls?: ReactNode
  // Conteúdo do estado de sucesso.
  children: ReactNode
}
