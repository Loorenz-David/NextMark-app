import { useOrderStateByServerId } from '@/features/order/store/orderStateHooks.store'
import { ArchiveOrderIcon, DeleteIcon, ItemIcon, SendBackIcon } from '@/assets/icons'

import type { Order } from '../../types/order'
import { StateCard } from '@/shared/layout/StateCard'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'
import { OrderMissingInfoNotifier } from '../OrderMissingInfoNotifier'
import { OrderOperationTypeBadges } from './OrderOperationTypeBadges'

type OrderCardProps = {
  order: Order
  onOpen?: (order: Order) => void
  onArchive?: (order:Order) => void
  onUnarchive?: (order: Order) => void
  isHovered?: boolean
}

export const OrderCard = ({ order, onOpen, onArchive, onUnarchive, isHovered = false }: OrderCardProps) => {
  const orderLabel = order.order_scalar_id != null ? `#${order.order_scalar_id}` : '#—'
  const streetAddress = order.client_address?.street_address ?? 'No address'
  const itemCount = order.total_items ?? 0

  const orderState =  useOrderStateByServerId( order.order_state_id ?? 1 )
  const external_source = order.external_source 
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 relative transition-colors ${
      isHovered
        ? 'border-[rgb(var(--color-light-blue-r),0.7)] border-2 bg-[var(--color-light-blue)]/10'
        : 'border-[var(--color-muted)]/30'
    }`}
      onClick={() => onOpen?.(order)}
    >
      <OrderMissingInfoNotifier order={order} />
      
      <div className="flex items-end justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate text-base font-semibold text-[var(--color-text)]">{orderLabel}</span>
            <OrderOperationTypeBadges operationType={order.operation_type} />
          </div>
          {external_source && (
            <div className="flex items-center justify-center">
              <span className="shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[0.5rem] uppercase tracking-wide text-[var(--color-muted)]">
                {external_source}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          {order.archive_at ? (
            <>
              <div className="flex absolute -top-4 left-0 items-center content-center bg-yellow-500 text-xs text-white px-2 py-1 rounded-md ">
                Archived
              </div>
              <div className="flex items-center content-center pr-1">
                <ConfirmActionButton
                  onConfirm={() => onUnarchive?.(order)}
                  confirmOverLay={'bg-green-700'}
                  deleteContent={
                    <div className="rounded-sm px-1 py-1 shadow-sm border-1 border-[var(--color-border)]">
                      <SendBackIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                    </div>
                  }
                  confirmContent={'Confirm unarchive'}
                  confirmClassName="text-white text-[10px] px-2 py-1 rounded-md bg-green-600"
                  duration={4000}
                />
              </div>
            </>
          ) : (
            onArchive && (
              <div className="flex items-center content-center pr-1 ">
                  <ConfirmActionButton
                    onConfirm={() => onArchive?.(order)}
                    deleteContent={
                      <div className="rounded-sm px-1 py-1 shadow-sm border-1 border-[var(--color-border)]">
                        <ArchiveOrderIcon className="h-4 w-4 text-[var(--color-muted)]/90" />
                      </div>
                    }
                    confirmContent={'Confirm archive'}
                    confirmClassName="text-white text-[10px] px-2 py-1 rounded-md bg-red-500"
                    duration={4000}
                  />
                </div>
            )
          )}
         { orderState && 
              <div className="flex gap-3 items-center">
                  <StateCard label={orderState.name} color={orderState.color ? orderState.color : "#363636ff"}/>
              </div>
          }
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
          <span className="truncate text-xs text-[var(--color-muted)]">{streetAddress}</span>
          <div className="flex items-center gap-2">
            <ItemIcon className="h-3 w-3 app-icon" />
            <span>{itemCount}</span>
          </div>
      </div>
    </div>
  )
}
