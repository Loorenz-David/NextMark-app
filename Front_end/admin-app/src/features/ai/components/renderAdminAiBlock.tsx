import type { AiBlockRendererProps } from '@nextmark/ai-panel'
import type { Order } from '@shared-domain'

import { AiOrderCard } from './AiOrderCard'
import { AiOrdersTable, type AiOrdersTableColumnExternalId } from './AiOrdersTable'

interface AdminAiBlockRenderOptions {
  onOrderRowClick?: (order: Order) => void
}

// Trust the block's entity_type declaration — any non-null object is a valid
// candidate when we're already inside an `entity_type: "order"` block.
function isNonNullObject(value: unknown): value is Order {
  return typeof value === 'object' && value !== null
}

function getOrdersFromBlockData(data: unknown): Order[] {
  if (Array.isArray(data)) {
    return data.filter(isNonNullObject)
  }

  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>

    // Accept either `items` or `orders` as the collection key
    const list = Array.isArray(d.items) ? d.items
      : Array.isArray(d.orders) ? d.orders
      : null

    if (list) {
      return list.filter(isNonNullObject)
    }
  }

  return []
}

function isOrdersTableColumnId(value: unknown): value is AiOrdersTableColumnExternalId {
  return value === 'order_scalar_id'
    || value === 'order_id'
    || value === 'total_items'
    || value === 'client_name'
    || value === 'street_address'
}

function getOrdersTableColumnsFromMeta(meta: unknown): AiOrdersTableColumnExternalId[] | undefined {
  if (typeof meta !== 'object' || meta === null) return undefined

  const candidate = (meta as { columns?: unknown; table?: { columns?: unknown } }).table?.columns
    ?? (meta as { columns?: unknown }).columns

  if (!Array.isArray(candidate)) return undefined

  const columns = candidate.filter(isOrdersTableColumnId)
  return columns.length ? columns : undefined
}

export function renderAdminAiBlock(
  { block }: AiBlockRendererProps,
  options: AdminAiBlockRenderOptions = {},
) {
  const { onOrderRowClick } = options

  if (block.entityType !== 'order') {
    return null
  }

  if (block.kind === 'entity_detail' && isNonNullObject(block.data)) {
    return <AiOrderCard onRowClick={onOrderRowClick} order={block.data} />
  }

  if (block.kind === 'entity_collection') {
    const orders = getOrdersFromBlockData(block.data)
    if (!orders.length) {
      return null
    }

    // `cards` layout renders individual cards; everything else renders a table
    if (block.layout === 'cards') {
      return (
        <div style={{ display: 'grid', gap: 8 }}>
          {orders.map((order, i) => (
            <AiOrderCard key={order.id ?? order.order_scalar_id ?? i} onRowClick={onOrderRowClick} order={order} />
          ))}
        </div>
      )
    }

    return (
      <AiOrdersTable
        columns={getOrdersTableColumnsFromMeta(block.meta)}
        onRowClick={onOrderRowClick}
        orders={orders}
      />
    )
  }

  return null
}
