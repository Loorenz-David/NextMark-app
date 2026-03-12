import { getActiveRoutesApi } from '../api'
import { mapActiveRoutesDtoToRoutes, type ActiveRoutesPayload } from '../domain'
import {
  mapRouteOrdersDtoToOrders,
  type RouteOrdersPayload,
} from '../orders/domain'
import {
  mapRouteStopsDtoToStops,
  type RouteStopsPayload,
} from '../stops/domain'

export type ActiveRoutesQueryResult = ActiveRoutesPayload & RouteOrdersPayload & RouteStopsPayload

export async function loadActiveRoutesQuery(): Promise<ActiveRoutesQueryResult> {
  const response = await getActiveRoutesApi()
  const dto = response.data ?? {
    routes: { byClientId: {}, allIds: [] },
    orders: { byClientId: {}, allIds: [] },
    stops: { byClientId: {}, allIds: [] },
  }

  return {
    ...mapActiveRoutesDtoToRoutes(dto),
    ...mapRouteOrdersDtoToOrders(dto),
    ...mapRouteStopsDtoToStops(dto),
  }
}
