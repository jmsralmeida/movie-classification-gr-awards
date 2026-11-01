import type { Ref } from 'react'

export interface StatusMessageProps {
  status: 'loading' | 'error' | 'empty'
  emptyMessage: string
  onRetry: () => void
  // Nova tentativa em andamento: o botão segue montado e focável, mas com aria-disabled e sem ação.
  retrying?: boolean
  // Aponta para o botão "Try again" (estado de erro), para quem precisar focá-lo.
  retryRef?: Ref<HTMLButtonElement>
}
