import type { RouteGroup } from "../types/routeGroup";
import type { RouteSolution } from "../types/routeSolution";
import type { RouteGroupRailItem } from "./routeGroupRailItem";
import type { DeliveryPlanState } from "@/features/plan/types/planState";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const resolveCompletionRatio = (
  routeGroup: RouteGroup,
  routeSolutions: RouteSolution[],
): number => {
  const totalOrders = Math.max(0, routeGroup.total_orders ?? 0);
  const selectedRouteSolution =
    routeSolutions.find((routeSolution) => routeSolution.is_selected) ??
    routeSolutions[0] ??
    null;
  const plannedStops = Math.max(0, selectedRouteSolution?.stop_count ?? 0);

  if (totalOrders === 0) {
    return plannedStops > 0 ? 100 : 0;
  }

  return clampPercent((plannedStops / totalOrders) * 100);
};

const resolveRouteGroupLabel = (routeGroup: RouteGroup, fallbackIndex: number) =>
  routeGroup.zone_snapshot?.name?.trim() ||
  (typeof routeGroup.zone_id === "number"
    ? `Zone ${routeGroup.zone_id}`
    : `Group ${fallbackIndex + 1}`);

const resolveZoneLabel = (routeGroup: RouteGroup, fallbackIndex: number) =>
  typeof routeGroup.zone_id === "number"
    ? `Zone ${routeGroup.zone_id}`
    : `Group ${fallbackIndex + 1}`;

const resolveRouteGroupState = (
  routeGroup: RouteGroup,
  routePlanStates: DeliveryPlanState[],
) => {
  const resolvedState =
    routePlanStates.find((state) => state.id === (routeGroup.state_id ?? null)) ??
    null;

  return {
    label: resolvedState?.name ?? routeGroup.state?.name?.trim() ?? null,
    color: resolvedState?.color ?? null,
  };
};

export const buildRouteGroupRailItems = ({
  routeGroups,
  routeSolutions,
  routePlanStates,
  activeRouteGroupId,
}: {
  routeGroups: RouteGroup[];
  routeSolutions: RouteSolution[];
  routePlanStates: DeliveryPlanState[];
  activeRouteGroupId: number | null;
}): RouteGroupRailItem[] =>
  routeGroups
    .filter((routeGroup): routeGroup is RouteGroup & { id: number } =>
      typeof routeGroup.id === "number",
    )
    .map((routeGroup, index) => {
      const routeGroupRouteSolutions = routeSolutions.filter(
        (routeSolution) => routeSolution.route_group_id === routeGroup.id,
      );
      const routeGroupState = resolveRouteGroupState(routeGroup, routePlanStates);

      return {
        route_group_id: routeGroup.id,
        label: resolveRouteGroupLabel(routeGroup, index),
        completionRatio: resolveCompletionRatio(
          routeGroup,
          routeGroupRouteSolutions,
        ),
        orderCount: Math.max(0, routeGroup.total_orders ?? 0),
        stateLabel: routeGroupState.label,
        stateColor: routeGroupState.color,
        routeSolutionCount: routeGroupRouteSolutions.length,
        zoneLabel: resolveZoneLabel(routeGroup, index),
        isActive: routeGroup.id === activeRouteGroupId,
      };
    });
