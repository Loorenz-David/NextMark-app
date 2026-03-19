import { getRouteByIdApi } from '../api'
import type { DriverRouteRecord } from '../domain'
import { mapRouteOrdersDtoToOrders, type DriverOrderRecord } from '../orders'
import { mapRouteStopsDtoToStops, type DriverRouteStopRecord } from '../stops'

export type RouteSnapshotQueryResult = {
  route: DriverRouteRecord
  orders: { byClientId: Record<string, DriverOrderRecord>; allIds: string[] }
  stops: { byClientId: Record<string, DriverRouteStopRecord>; allIds: string[] }
}

export async function loadRouteByIdQuery(routeId: number): Promise<RouteSnapshotQueryResult> {
  const response = await getRouteByIdApi(routeId)
  const dto = response.data

  if (!dto?.route) {
    throw new Error('Route response did not include route data.')
  }

  return {
    route: dto.route,
    orders: mapRouteOrdersDtoToOrders({ orders: dto.orders ?? { byClientId: {}, allIds: [] } }).orders,
    stops: mapRouteStopsDtoToStops({ stops: dto.stops ?? { byClientId: {}, allIds: [] } }).stops,
  }
}
