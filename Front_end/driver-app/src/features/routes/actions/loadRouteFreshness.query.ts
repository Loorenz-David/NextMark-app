import { getRouteFreshnessApi } from '../api'

export type RouteFreshnessQueryResult = {
  routeId: number
  deliveryPlanId: number | null
  routeFreshnessUpdatedAt: string | null
}

export async function loadRouteFreshnessQuery(routeId: number): Promise<RouteFreshnessQueryResult> {
  const response = await getRouteFreshnessApi(routeId)
  const dto = response.data

  if (!dto || typeof dto.route_id !== 'number') {
    throw new Error('Route freshness response did not include route data.')
  }

  return {
    routeId: dto.route_id,
    deliveryPlanId: dto.delivery_plan_id ?? null,
    routeFreshnessUpdatedAt: dto.route_freshness_updated_at ?? null,
  }
}
