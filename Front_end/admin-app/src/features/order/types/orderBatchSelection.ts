import type { OrderPlanUpdateResponse } from './order'

export type OrderSelectAllSnapshot = {
  key: string
  query: Record<string, unknown>
  estimatedCount: number
}

export type OrderBatchSelectionPayload = {
  manual_order_ids: number[]
  select_all_snapshots: Array<{
    query: Record<string, unknown>
    client_signature?: string
  }>
  excluded_order_ids: number[]
  source?: 'single' | 'group' | 'selection'
}

export type OrderBatchSelectionResolveResponse = {
  signature: string
  resolved_count: number
  sample_ids?: number[]
}

export type OrderBatchMoveResponse = {
  signature: string
  resolved_count: number
  updated_count: number
  updated_bundles: OrderPlanUpdateResponse['updated']
}
