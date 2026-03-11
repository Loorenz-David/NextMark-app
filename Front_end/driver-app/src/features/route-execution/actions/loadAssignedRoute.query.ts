import { routeExecutionApi } from '@/app/services/routeExecution.api'
import { mapAssignedRouteResponseToAssignedRouteViewModel } from '../domain/mapAssignedRouteResponseToAssignedRouteViewModel'

export async function loadAssignedRouteQuery() {
  const response = await routeExecutionApi.getAssignedRoute()
  return mapAssignedRouteResponseToAssignedRouteViewModel(response.data ?? { route: null })
}
