import { useRouteGroupByServerId } from '@/features/plan/routeGroup/store/useRouteGroup.selector'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import {
  useRouteSolutionsByRouteGroupId,
  useSelectedRouteSolutionByRouteGroupId,
} from '@/features/plan/routeGroup/store/useRouteSolution.selector'

import type { PopupPayload } from './RouteGroupEditForm.types'

export const useRouteGroupEditFormContextData = (entryPayload?: PopupPayload) => {
  const rawRouteGroupId =
    entryPayload?.routeGroupId ?? entryPayload?.route_group_id ?? null
  const parsedRouteGroupId =
    typeof rawRouteGroupId === 'string'
      ? Number(rawRouteGroupId)
      : rawRouteGroupId
  const routeGroupId =
    typeof parsedRouteGroupId === 'number' && Number.isNaN(parsedRouteGroupId)
      ? null
      : parsedRouteGroupId

  const routeGroup = useRouteGroupByServerId(routeGroupId)
  const plan = useRoutePlanByServerId(routeGroup?.route_plan_id)
  const selectedRouteSolution = useSelectedRouteSolutionByRouteGroupId(routeGroupId)
  const routeSolutions = useRouteSolutionsByRouteGroupId(routeGroupId)

  return {
    routeGroupId,
    routeGroup,
    plan,
    selectedRouteSolution,
    routeSolutions,
  }
}
