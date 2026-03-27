import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";

import type { RouteGroup } from "../types/routeGroup";

export type MaterializeRouteGroupsPayload = {
  zone_ids: number[];
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
};
