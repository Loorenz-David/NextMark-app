import type { Order } from '../types/order'
import type { OrderQueryFilters } from '../types/orderMeta'

export const reactiveOrderVisibility = (
  order: Order,
  filters: OrderQueryFilters,
): boolean => {
  if (!order) return false
  const isArchived = order.archive_at != null

  // unscheduled orders
  if (filters.unschedule_order && order.delivery_plan_id != null) {
    return false
  }

  // scheduled orders
  if (filters.schedule_order && order.delivery_plan_id == null) {
    return false
  }

  // archived visibility (mirror backend find_orders semantics)
  if (filters.show_archived === true) {
    if (!isArchived) {
      return false
    }
  } else if (isArchived) {
    return false
  }

  // order state filtering
  if (filters.order_state_id != null) {
    const stateFilter = filters.order_state_id
    if (Array.isArray(stateFilter)) {
      if (!stateFilter.includes(order.order_state_id ?? -1)) {
        return false
      }
    } else {
      if (order.order_state_id !== stateFilter) {
        return false
      }
    }
  }

  return true
}
