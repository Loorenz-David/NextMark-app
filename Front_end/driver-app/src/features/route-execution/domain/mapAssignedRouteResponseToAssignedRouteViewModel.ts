import type { AssignedRouteViewModel } from '@/app/contracts/routeExecution.types'
import type { AssignedRouteResponse } from '@/app/services/routeExecution.api'

export function mapAssignedRouteResponseToAssignedRouteViewModel(
  response: AssignedRouteResponse,
): AssignedRouteViewModel | null {
  return response.route ?? null
}
