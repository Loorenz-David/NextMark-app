import { CloseIcon, ItemIcon } from '@/assets/icons'
import { MarkerAnchorPopover } from '@/shared/map/components/MarkerAnchorPopover'
import { useOrderStore } from '@/features/order/store/order.store'
import { useOrderActions } from '@/features/order/actions/order.actions'
import {
  useOrderGroupMarkerOverlay,
  useOrderMapInteractionActions,
} from '@/features/order/store/orderMapInteractionHooks.store'

export const OrderMarkerGroupOverlay = () => {
  const groupOverlay = useOrderGroupMarkerOverlay()
  const byClientId = useOrderStore((state) => state.byClientId)
  const { closeGroupOverlay } = useOrderMapInteractionActions()
  const { openOrderDetail } = useOrderActions()

  const markerId = groupOverlay.markerId
  const anchorEl = groupOverlay.markerAnchorEl
  const isOpen = Boolean(markerId && anchorEl)

  const orders = groupOverlay.orderClientIds
    .map((clientId) => byClientId[clientId])
    .filter((order) => Boolean(order))

  return (
    <MarkerAnchorPopover
      open={isOpen}
      anchorEl={anchorEl}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeGroupOverlay()
      }}
      className="z-50"
    >
      <div className="w-[280px] rounded-xl border border-[var(--color-border)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
          <p className="text-xs font-semibold text-[var(--color-text)]">
            {orders.length} grouped orders
          </p>
          <button
            type="button"
            onClick={closeGroupOverlay}
            aria-label="Close grouped marker list"
            className="rounded-md p-1 text-[var(--color-muted)] transition-colors hover:bg-[var(--color-muted)]/10"
          >
            <CloseIcon className="h-3 w-3" />
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto scroll-thin px-2 py-2">
          <div className="flex flex-col gap-2">
            {orders.map((order) => {
              const address = order.client_address?.street_address ?? 'No address'
              const orderLabel = order.reference_number ?? order.external_order_id ?? order.client_id
              const totalItems = order.total_items ?? 0

              return (
                <button
                  key={order.client_id}
                  type="button"
                  onClick={() => {
                    openOrderDetail(
                      { clientId: order.client_id, mode: 'view' },
                      { pageClass: 'bg-[var(--color-muted)]/10 ', borderLeft: 'rgb(var(--color-light-blue-r),0.7)' },
                    )
                    closeGroupOverlay()
                  }}
                  className="w-full rounded-lg border border-[var(--color-border)]/60 bg-white px-3 py-2 text-left transition-colors hover:bg-[var(--color-light-blue)]/10"
                >
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {orderLabel}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-[var(--color-muted)]">
                      {address}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
                      <ItemIcon className="h-3 w-3 app-icon" />
                      <span>{totalItems}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </MarkerAnchorPopover>
  )
}

