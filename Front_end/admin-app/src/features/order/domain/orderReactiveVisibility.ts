import type { Order } from '../types/order'
import type { OrderQueryFilters } from '../types/orderMeta'

const normalizePlanIdFilters = (value: OrderQueryFilters['plan_id']): number[] => {
  if (value == null) return []
  const values = Array.isArray(value) ? value : [value]
  return values
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
}

export const reactiveOrderVisibility = (
  order: Order,
  filters: OrderQueryFilters,
): boolean => {
  if (!order) return false
  const isArchived = order.archive_at != null

  // unscheduled orders
  if (filters.unschedule_order && order.route_plan_id != null) {
    return false
  }

  // scheduled orders
  if (filters.schedule_order && order.route_plan_id == null) {
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

  // plan id filtering
  if (filters.plan_id != null) {
    const planIds = normalizePlanIdFilters(filters.plan_id)
    if (!planIds.length) {
      return false
    }

    if (order.route_plan_id == null) {
      return false
    }

    if (!planIds.includes(order.route_plan_id)) {
      return false
    }
  }

  return true
}
