import { useShallow } from 'zustand/react/shallow'

import { useOrdersByPlanId } from '@/features/order/store/orderHooks.store'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'

import { useRouteGroupDerivedResources } from '../flows/routeGroupDerivedResources.flow'
import { useActiveRouteGroupId } from '../store/useActiveRouteGroup.selector'
import { useRouteGroupsByPlanId } from '../store/useRouteGroup.selector'
import {
  useRouteSolutionsByRouteGroupId,
  useSelectedRouteSolutionByRouteGroupId,
} from '../store/useRouteSolution.selector'
import {
  selectRouteSolutionStopsBySolutionId,
  useRouteSolutionStopStore,
} from '../store/routeSolutionStop.store'

export const useActiveRouteGroupResourcesController = (planId: number | null) => {
  const plan = useRoutePlanByServerId(planId)
  const routeGroups = useRouteGroupsByPlanId(planId)
  const activeRouteGroupId = useActiveRouteGroupId()
  const routeGroup = routeGroups.find((candidateRouteGroup) => candidateRouteGroup.id === activeRouteGroupId)
    ?? routeGroups[0]
    ?? null
  const routeGroupId = routeGroup?.id ?? null
  const orders = useOrdersByPlanId(planId)
  const routeSolutions = useRouteSolutionsByRouteGroupId(routeGroupId)
  const storedSelectedRouteSolution = useSelectedRouteSolutionByRouteGroupId(routeGroupId)
  const selectedRouteSolution = storedSelectedRouteSolution ?? routeSolutions[0] ?? null
  const routeSolutionId = selectedRouteSolution?.id ?? null
  const routeSolutionStops = useRouteSolutionStopStore(
    useShallow(selectRouteSolutionStopsBySolutionId(routeSolutionId)),
  )
  const planStartDate = plan?.start_date ?? null

  const {
    planState,
    routeSolutionsOrdered,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
  } = useRouteGroupDerivedResources({
    plan: plan ?? null,
    orders,
    routeSolutions,
    routeSolutionStops,
    selectedRouteSolution,
  })

  return {
    plan,
    planState,
    planStartDate,
    routeGroups,
    activeRouteGroupId,
    routeGroup,
    routeGroupId,
    orders,
    orderCount: orders.length,
    routeSolutions,
    routeSolutionsOrdered,
    storedSelectedRouteSolutionId: storedSelectedRouteSolution?.id ?? null,
    selectedRouteSolution,
    routeSolutionId,
    routeSolutionStops,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
    stopByOrderId,
    ordersById,
    boundaryLocations,
  }
}
