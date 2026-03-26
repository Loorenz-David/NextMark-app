import type { ReactNode } from 'react'
import { DragOverlay } from '@dnd-kit/core'
import type { ActiveDrag } from '@/features/local-delivery-orders/dnd/usePlanOrderDndController'
import type { PlanTypeKey } from '@/features/plan/types/plan'
import { OrderCard } from '@/features/order/components/cards/OrderCard'
import { OrderBatchDragOverlayCard } from '@/features/order/components/cards/OrderBatchDragOverlayCard'
import { OrderGroupDragOverlayCard } from '@/features/order/components/cards/OrderGroupDragOverlayCard'
import { RouteStopDragOverlay } from '@/features/local-delivery-orders/components/overlays/RouteStopDragOverlay'
import { RouteStopGroupDragOverlay } from '@/features/local-delivery-orders/components/overlays/RouteStopGroupDragOverlay'

type PlanTypeDragOverlayProps = {
  planType: PlanTypeKey | null
  activeDrag: ActiveDrag
}

export const PlanTypeDragOverlay = ({ planType, activeDrag }: PlanTypeDragOverlayProps) => {
  if (!planType || !activeDrag) {
    return null
  }

  // Local delivery overlays
  if (planType === 'local_delivery') {
    if (activeDrag.type === 'route_stop') {
      return (
        <div className="pointer-events-none cursor-grabbing">
          <RouteStopDragOverlay
            routeStopClientId={activeDrag.routeStopClientId}
            order={activeDrag.order}
            stop={activeDrag.stop}
            planStartDate={activeDrag.planStartDate}
          />
        </div>
      )
    }

    if (activeDrag.type === 'route_stop_group') {
      return (
        <div className="pointer-events-none cursor-grabbing">
          <RouteStopGroupDragOverlay
            count={activeDrag.count}
            label={activeDrag.label}
            firstStopOrder={activeDrag.firstStopOrder}
            lastStopOrder={activeDrag.lastStopOrder}
          />
        </div>
      )
    }
  }

  // Common overlays (all plan types support order dragging)
  if (activeDrag.type === 'order') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <OrderCard order={activeDrag.order} />
      </div>
    )
  }

  if (activeDrag.type === 'order_batch') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <OrderBatchDragOverlayCard
          selectedCount={activeDrag.selectedCount}
          isLoading={activeDrag.isLoading}
        />
      </div>
    )
  }

  if (activeDrag.type === 'order_group') {
    return (
      <div className="pointer-events-none cursor-grabbing">
        <OrderGroupDragOverlayCard
          count={activeDrag.count}
          label={activeDrag.label}
        />
      </div>
    )
  }

  return null
}
