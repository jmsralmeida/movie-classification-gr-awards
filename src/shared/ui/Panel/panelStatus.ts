import type { PanelStatus } from './Panel.types'

export function getPanelStatus(
  query: { isError: boolean; isPending: boolean },
  isEmpty: boolean,
): PanelStatus {
  if (query.isError) return 'error'
  if (query.isPending) return 'loading'
  if (isEmpty) return 'empty'
  return 'success'
}
