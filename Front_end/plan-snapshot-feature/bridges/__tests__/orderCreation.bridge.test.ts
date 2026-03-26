import { handlePlanOrderCreation } from '../orderCreation.bridge'

import { clearPlans, insertPlan } from '@/features/plan/store/plan.slice'
import {
  clearRouteSolutions,
  useRouteSolutionStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import {
  clearRouteSolutionStops,
  useRouteSolutionStopStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'
import type { OrderCreateBundle } from '@/features/order/types/order'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const buildBundle = (deliveryPlanId?: number): OrderCreateBundle => ({
  order: {
    client_id: 'order_1',
    id: 1,
    delivery_plan_id: deliveryPlanId ?? null,
  },
  order_stops: [
    {
      client_id: 'stop_1',
      route_solution_id: 10,
      stop_order: 1,
      order_id: 1,
    },
  ],
  route_solution: [
    {
      client_id: 'route_10',
      id: 10,
      local_delivery_plan_id: 20,
      route_end_strategy: 'round_trip',
    },
  ],
})

const resetStores = () => {
  clearPlans()
  clearRouteSolutions()
  clearRouteSolutionStops()
}

export const runOrderCreationBridgeTests = () => {
  {
    resetStores()
    handlePlanOrderCreation(buildBundle(undefined))
    assert(
      useRouteSolutionStopStore.getState().allIds.length === 0,
      'missing delivery_plan_id should no-op',
    )
  }

  {
    resetStores()
    handlePlanOrderCreation(buildBundle(999))
    assert(
      useRouteSolutionStore.getState().allIds.length === 0,
      'missing plan should no-op',
    )
  }

  {
    resetStores()
    insertPlan({
      client_id: 'plan_local_1',
      id: 101,
      label: 'Plan',
      plan_type: 'local_delivery',
    })
    handlePlanOrderCreation(buildBundle(101))

    assert(
      useRouteSolutionStore.getState().allIds.includes('route_10'),
      'local_delivery plan should apply route solution updates',
    )
    assert(
      useRouteSolutionStopStore.getState().allIds.includes('stop_1'),
      'local_delivery plan should apply route stop updates',
    )
  }

  {
    resetStores()
    insertPlan({
      client_id: 'plan_pickup_1',
      id: 201,
      label: 'Plan',
      plan_type: 'store_pickup',
    })
    handlePlanOrderCreation(buildBundle(201))
    assert(
      useRouteSolutionStore.getState().allIds.length === 0,
      'non-local plan types should no-op',
    )
  }

  resetStores()
}
