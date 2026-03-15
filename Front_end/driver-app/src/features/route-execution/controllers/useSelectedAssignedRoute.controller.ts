import { useMemo } from 'react'
import { useDriverOrderStateRegistry } from '@/features/order-states'
import {
  selectAllOrders,
  selectSelectedRoute,
  selectStopsByRouteRecord,
  useOrdersStore,
  useRoutesSelectionStore,
  useRoutesStore,
  useStopsStore,
} from '@/features/routes'
import { createDriverOrderLookup, mapDriverRouteRecordToAssignedRouteViewModel } from '../domain/mapActiveRoutesToAssignedRouteViewModel'

export function useSelectedAssignedRoute() {
  const orderStateRegistry = useDriverOrderStateRegistry()
  const routesState = useRoutesStore((state) => state)
  const routesSelectionState = useRoutesSelectionStore((state) => state)
  const ordersState = useOrdersStore((state) => state)
  const stopsState = useStopsStore((state) => state)

  return useMemo(() => {
    const selectedRoute = selectSelectedRoute(routesSelectionState, routesState)
    const orderLookup = createDriverOrderLookup(selectAllOrders(ordersState))
    const routeStops = selectStopsByRouteRecord(stopsState, selectedRoute)
    return mapDriverRouteRecordToAssignedRouteViewModel(selectedRoute, orderLookup, routeStops, {
      processingId: orderStateRegistry.getStateIdByName('Processing'),
      completedId: orderStateRegistry.getStateIdByName('Completed'),
      failId: orderStateRegistry.getStateIdByName('Fail'),
    })
  }, [orderStateRegistry, ordersState, routesSelectionState, routesState, stopsState])
}
