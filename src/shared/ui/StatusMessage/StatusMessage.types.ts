import type { Ref } from 'react'

export interface StatusMessageProps {
  status: 'loading' | 'error' | 'empty'
  emptyMessage: string
  onRetry: () => void
  // Aponta para o botão "Try again" (estado de erro), para quem precisar focá-lo.
  retryRef?: Ref<HTMLButtonElement>
}
