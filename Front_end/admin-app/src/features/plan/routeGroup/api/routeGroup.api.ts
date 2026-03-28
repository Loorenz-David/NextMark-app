import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type {
  OrderBatchSelectionPayload,
  PlanTotalsEntry,
} from "@shared-domain";

import type { Order } from "@/features/order/types/order";
import type { RouteGroup } from "../types/routeGroup";
import type { RouteSolution } from "../types/routeSolution";
import type { RouteSolutionStop } from "../types/routeSolutionStop";

export type MaterializeRouteGroupsPayload = {
  zone_ids: number[];
};

export type MoveOrderToRouteGroupPayload = {
  selection: OrderBatchSelectionPayload;
  route_group_id: number;
  prevent_event_bus: false;
};

export type OrderGroupMovedBundle = {
  order: Order;
  order_stops?: RouteSolutionStop[];
  route_solution?: RouteSolution[];
  plan_totals?: PlanTotalsEntry[];
};

export type MoveOrderToRouteGroupResponse = {
  updated?: OrderGroupMovedBundle[];
  updated_bundles?: OrderGroupMovedBundle[];
  resolved_count?: number;
  updated_count?: number;
};

export const routeGroupApi = {
  materializeRouteGroups: (
    planId: number | string,
    payload: MaterializeRouteGroupsPayload,
  ): Promise<ApiResult<RouteGroup[]>> =>
    apiClient.request<RouteGroup[]>({
      path: `/route-plans/${planId}/route-groups/materialize`,
      method: "POST",
      data: payload,
    }),
  moveOrderToRouteGroup: (
    planId: number,
    payload: MoveOrderToRouteGroupPayload,
  ): Promise<ApiResult<MoveOrderToRouteGroupResponse>> =>
    apiClient.request<MoveOrderToRouteGroupResponse>({
      path: `/order_assignments/plans/${planId}/batch`,
      method: "PATCH",
      data: payload,
    }),
};
