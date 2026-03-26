import { useEffect, useRef } from 'react'
import { shouldRefreshForFreshness } from '@shared-utils'

import { useRouteGroupOverviewFlow } from '@/features/plan/routeGroup/flows/routeGroupOverview.flow'
import { useRouteGroupsByPlanId } from '@/features/plan/routeGroup/store/useRouteGroup.selector'
import {
  useRouteSolutionsByRouteGroupId,
  useSelectedRouteSolutionByRouteGroupId,
} from '@/features/plan/routeGroup/store/useRouteSolution.selector'
import { useRoutePlanByServerId } from '@/features/plan/store/useRoutePlan.selector'
import { isRouteOperationsFixtureModeEnabled } from '@/features/home-route-operations/dev/routeOperationsFixtureMode'
import { useActiveRouteGroupId } from '../store/useActiveRouteGroup.selector'

export const useRouteGroupPageInitializationFlow = (
  planId: number | null,
  freshAfter?: string | null,
  options?: { disabled?: boolean },
) => {
  const { fetchRouteGroupOverview } = useRouteGroupOverviewFlow()
  const isFixtureMode = isRouteOperationsFixtureModeEnabled()
  const plan = useRoutePlanByServerId(planId)
  const routeGroups = useRouteGroupsByPlanId(planId)
  const activeRouteGroupId = useActiveRouteGroupId()
  const routeGroup = routeGroups.find((routeGroup) => routeGroup.id === activeRouteGroupId)
    ?? routeGroups[0]
    ?? null
  const routeGroupId = routeGroup?.id ?? null
  const routeSolutions = useRouteSolutionsByRouteGroupId(routeGroupId)
  const selectedRouteSolution = (
    useSelectedRouteSolutionByRouteGroupId(routeGroupId)
    ?? routeSolutions[0]
    ?? null
  )
  const lastRefreshAttemptRef = useRef<string | null>(null)

  useEffect(() => {
    if (options?.disabled || isFixtureMode) {
      lastRefreshAttemptRef.current = null
      return
    }

    if (planId == null) {
      lastRefreshAttemptRef.current = null
      return
    }

    const isWorkspaceHydrated = Boolean(
      routeGroups.length > 0
      && routeGroup
      && routeSolutions.length > 0
      && selectedRouteSolution,
    )
    const needsRefresh = (
      plan == null
      || !isWorkspaceHydrated
      || shouldRefreshForFreshness(plan.updated_at ?? null, freshAfter ?? null)
    )
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null
      return
    }

    const refreshKey = `${planId}:${freshAfter ?? ''}`
    if (lastRefreshAttemptRef.current === refreshKey) {
      return
    }
    lastRefreshAttemptRef.current = refreshKey

    fetchRouteGroupOverview(planId)
  }, [
    fetchRouteGroupOverview,
    freshAfter,
    routeGroup,
    plan,
    planId,
    routeGroups,
    routeSolutions.length,
    selectedRouteSolution,
    options?.disabled,
    isFixtureMode,
  ])
}
