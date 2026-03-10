import {
  resolveOrderCreationHandler,
} from '../planTypeOrderCreation.registry'

import {
  clearRouteSolutions,
  useRouteSolutionStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolution.store'
import {
  clearRouteSolutionStops,
  useRouteSolutionStopStore,
} from '@/features/plan/planTypes/localDelivery/store/routeSolutionStop.store'
import type { OrderCreateBundle } from '@/features/order/types/order'
import type { PlanTypeKey } from '@/features/plan/types/plan'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const buildBundle = (): OrderCreateBundle => ({
  order: {
    client_id: 'order_1',
    id: 1,
    delivery_plan_id: 1,
  },
  order_stops: [
    {
      client_id: 'stop_registry_1',
      route_solution_id: 11,
      stop_order: 1,
      order_id: 1,
    },
  ],
  route_solution: [
    {
      client_id: 'route_registry_11',
      id: 11,
      local_delivery_plan_id: 22,
      route_end_strategy: 'round_trip',
    },
  ],
})

const resetStores = () => {
  clearRouteSolutions()
  clearRouteSolutionStops()
}

export const runPlanTypeOrderCreationRegistryTests = () => {
  {
    const handler = resolveOrderCreationHandler('local_delivery')
    assert(typeof handler === 'function', 'local_delivery should resolve a handler')
  }

  {
    const handler = resolveOrderCreationHandler('international_shipping')
    assert(handler === null, 'international_shipping should resolve to no-op/null')
  }

  {
    const handler = resolveOrderCreationHandler('unknown' as PlanTypeKey)
    assert(handler === null, 'unknown plan type should resolve to null')
  }

  {
    resetStores()
    const handler = resolveOrderCreationHandler('local_delivery')
    assert(typeof handler === 'function', 'local_delivery handler is required')
    handler?.(buildBundle())
    assert(
      useRouteSolutionStopStore.getState().allIds.includes('stop_registry_1'),
      'local handler should upsert stops',
    )
    assert(
      useRouteSolutionStore.getState().allIds.includes('route_registry_11'),
      'local handler should upsert route solutions',
    )
  }

  {
    resetStores()
    const handler = resolveOrderCreationHandler('local_delivery')
    handler?.({
      order: {
        client_id: 'order_2',
        id: 2,
        delivery_plan_id: 2,
      },
    })
    assert(
      useRouteSolutionStore.getState().allIds.length === 0,
      'missing optional fields should not throw or mutate',
    )
  }

  resetStores()
}

