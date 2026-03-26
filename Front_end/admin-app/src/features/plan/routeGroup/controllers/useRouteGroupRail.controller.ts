import { useCallback, useMemo } from 'react'

import type { RouteGroupRailItem } from '@/features/plan/routeGroup/components'
import { useRouteGroupsByPlanId } from '@/features/plan/routeGroup/store/useRouteGroup.selector'
import { useActiveRouteGroupActions, useActiveRouteGroupId } from '@/features/plan/routeGroup/store/useActiveRouteGroup.selector'

export const useRouteGroupRailController = (planId: number | null | undefined) => {
  const routeGroups = useRouteGroupsByPlanId(planId)
  const activeRouteGroupId = useActiveRouteGroupId()
  const { setActiveRouteGroupId } = useActiveRouteGroupActions()

  const railItems = useMemo<RouteGroupRailItem[]>(
    () =>
      routeGroups.map((routeGroup, index) => ({
        route_group_id: routeGroup.id ?? index + 1,
        label: `Group ${index + 1}`,
        isActive: routeGroup.id === activeRouteGroupId,
      })),
    [activeRouteGroupId, routeGroups],
  )

  const handleRouteGroupClick = useCallback((item: RouteGroupRailItem) => {
    setActiveRouteGroupId(item.route_group_id)
  }, [setActiveRouteGroupId])

  return {
    railItems,
    handleRouteGroupClick,
  }
}
