import type { ActiveRoutesDto, RouteDtoCollection } from '../api/routes.dto'
import type { ActiveRoutesPayload, DriverRouteRecord } from './routes.types'

function mapRouteCollection(
  collection: RouteDtoCollection<DriverRouteRecord>,
): RouteDtoCollection<DriverRouteRecord> {
  return {
    byClientId: { ...collection.byClientId },
    allIds: [...collection.allIds],
  }
}

export function mapActiveRoutesDtoToRoutes(
  dto: ActiveRoutesDto,
): ActiveRoutesPayload {
  return {
    routes: mapRouteCollection(dto.routes),
  }
}
