import { useMemo, useSyncExternalStore } from 'react'
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
  const routesState = useSyncExternalStore(
    useRoutesStore.subscribe,
    useRoutesStore.getState,
    useRoutesStore.getState,
  )
  const routesSelectionState = useSyncExternalStore(
    useRoutesSelectionStore.subscribe,
    useRoutesSelectionStore.getState,
    useRoutesSelectionStore.getState,
  )
  const ordersState = useSyncExternalStore(
    useOrdersStore.subscribe,
    useOrdersStore.getState,
    useOrdersStore.getState,
  )
  const stopsState = useSyncExternalStore(
    useStopsStore.subscribe,
    useStopsStore.getState,
    useStopsStore.getState,
  )

  return useMemo(() => {
    const selectedRoute = selectSelectedRoute(routesSelectionState, routesState)
    const orderLookup = createDriverOrderLookup(selectAllOrders(ordersState))
    const routeStops = selectStopsByRouteRecord(stopsState, selectedRoute)
    return mapDriverRouteRecordToAssignedRouteViewModel(selectedRoute, orderLookup, routeStops)
  }, [ordersState, routesSelectionState, routesState, stopsState])
}
