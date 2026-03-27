import { useCallback, useMemo } from "react";

import { buildRouteGroupRailItems } from "@/features/plan/routeGroup/domain/buildRouteGroupRailItems";
import type { RouteGroupRailItem } from "@/features/plan/routeGroup/domain/routeGroupRailItem";
import { useRouteGroupsByPlanId } from "@/features/plan/routeGroup/store/useRouteGroup.selector";
import {
  useActiveRouteGroupActions,
  useActiveRouteGroupId,
} from "@/features/plan/routeGroup/store/useActiveRouteGroup.selector";
import { useRouteSolutions } from "@/features/plan/routeGroup/store/useRouteSolution.selector";
import { useRoutePlanStates } from "@/features/plan/store/useRoutePlanState.selector";

export const useRouteGroupRailController = (
  planId: number | null | undefined,
) => {
  const routeGroups = useRouteGroupsByPlanId(planId);
  const routeSolutions = useRouteSolutions();
  const routePlanStates = useRoutePlanStates();
  const activeRouteGroupId = useActiveRouteGroupId();
  const { clearActiveRouteGroupSelection, setActiveRouteGroupId } =
    useActiveRouteGroupActions();
  const { rememberRouteGroupForPlan } = useActiveRouteGroupActions();

  const railItems = useMemo<RouteGroupRailItem[]>(
    () =>
      buildRouteGroupRailItems({
        routeGroups,
        routeSolutions,
        routePlanStates,
        activeRouteGroupId,
      }),
    [activeRouteGroupId, routeGroups, routePlanStates, routeSolutions],
  );

  const handleRouteGroupClick = useCallback(
    (item: RouteGroupRailItem) => {
      if (item.route_group_id === activeRouteGroupId) {
        clearActiveRouteGroupSelection();
        return;
      }
      setActiveRouteGroupId(item.route_group_id);
      if (typeof planId === "number") {
        rememberRouteGroupForPlan(planId, item.route_group_id);
      }
    },
    [
      activeRouteGroupId,
      clearActiveRouteGroupSelection,
      planId,
      rememberRouteGroupForPlan,
      setActiveRouteGroupId,
    ],
  );

  return {
    railItems,
    handleRouteGroupClick,
  };
};
