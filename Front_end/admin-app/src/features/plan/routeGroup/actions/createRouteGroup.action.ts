import type { RouteGroup } from "@/features/plan/routeGroup/types/routeGroup";
import {
  routeGroupApi,
  type CreateRouteGroupPayload,
} from "@/features/plan/routeGroup/api/routeGroup.api";

export const createRouteGroupAction = async (
  planId: number,
  payload: CreateRouteGroupPayload,
): Promise<RouteGroup | null> => {
  const response = await routeGroupApi.createRouteGroup(planId, payload);
  return response.data ?? null;
};
