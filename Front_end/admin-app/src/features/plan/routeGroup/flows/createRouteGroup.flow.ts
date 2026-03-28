import { buildClientId } from "@/lib/utils/clientId";
import type { DeliveryPlan } from "@/features/plan/types/plan";
import { buildRouteGroupPlanTypeDefaults } from "@/features/plan/routeGroup/domain/planTypeDefaults/routeGroupDefaults.generator";
import { createRouteGroupAction } from "@/features/plan/routeGroup/actions/createRouteGroup.action";
import type { CreateRouteGroupFormState } from "@/features/plan/routeGroup/forms/createRouteGroupForm/CreateRouteGroupForm.types";
import {
  insertRouteGroup,
  removeRouteGroup,
  upsertRouteGroup,
} from "@/features/plan/routeGroup/store/routeGroup.slice";
import type {
  GeoJSONPolygon,
  RouteGroup,
} from "@/features/plan/routeGroup/types/routeGroup";
import {
  rememberRouteGroupForPlan,
  setActiveRouteGroupId,
} from "@/features/plan/routeGroup/store/activeRouteGroup.store";
import {
  selectRenderableZoneGeometry,
  selectWorkingZoneVersionId,
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import { resolveUserCurrentLocation } from "@/shared/utils/resolveUserCurrentLocation";

type RunCreateRouteGroupFlowInput = {
  planId: number;
  plan: DeliveryPlan | null;
  formState: CreateRouteGroupFormState;
};

type RunCreateRouteGroupFlowResult =
  | { ok: true; routeGroup: RouteGroup }
  | { ok: false; error: string };

const createOptimisticRouteGroup = ({
  planId,
  clientId,
  tempId,
  formState,
}: {
  planId: number;
  clientId: string;
  tempId: number;
  formState: CreateRouteGroupFormState;
}): RouteGroup => {
  const zoneVersionId = selectWorkingZoneVersionId(useZoneStore.getState());
  const selectedZone =
    typeof zoneVersionId === "number" && typeof formState.zone_id === "number"
      ? selectZoneByVersionAndId(
          useZoneStore.getState(),
          zoneVersionId,
          formState.zone_id,
        )
      : null;
  const zoneGeometry =
    typeof zoneVersionId === "number" && typeof formState.zone_id === "number"
      ? (selectRenderableZoneGeometry(
          useZoneStore.getState(),
          zoneVersionId,
          formState.zone_id,
        ) as GeoJSONPolygon | null)
      : null;

  return {
    id: tempId,
    client_id: clientId,
    route_plan_id: planId,
    zone_id: formState.zone_id,
    zone_snapshot: {
      name: selectedZone?.name?.trim() || formState.name.trim() || "New route group",
      geometry: zoneGeometry,
    },
    template_snapshot: null,
    total_orders: 0,
    state: null,
    route_solutions_ids: [],
  };
};

export const runCreateRouteGroupFlow = async ({
  planId,
  plan,
  formState,
}: RunCreateRouteGroupFlowInput): Promise<RunCreateRouteGroupFlowResult> => {
  const clientId = buildClientId("route_group");
  const trimmedName = formState.name.trim();
  const isZoneBacked = typeof formState.zone_id === "number";
  const tempId = -Date.now();

  const optimisticRouteGroup = createOptimisticRouteGroup({
    planId,
    clientId,
    tempId,
    formState,
  });

  insertRouteGroup(optimisticRouteGroup);
  setActiveRouteGroupId(tempId);
  rememberRouteGroupForPlan(planId, tempId);

  try {
    const noZoneDefaults = !isZoneBacked
      ? await buildRouteGroupPlanTypeDefaults({
          getCurrentLocationAddress: resolveUserCurrentLocation,
          planStartDate: plan?.start_date ?? null,
        })
      : null;

    const routeGroup = await createRouteGroupAction(planId, {
      zone_id: formState.zone_id,
      name: !isZoneBacked ? trimmedName : undefined,
      route_group_defaults: {
        client_id: clientId,
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(!isZoneBacked
          ? {
              route_solution:
                noZoneDefaults?.route_group_defaults?.route_solution,
            }
          : {}),
      },
    });

    if (!routeGroup) {
      removeRouteGroup(clientId);
      setActiveRouteGroupId(null);
      return {
        ok: false,
        error: "Route group could not be created.",
      };
    }

    upsertRouteGroup({
      ...routeGroup,
      client_id: routeGroup.client_id || clientId,
    });

    if (typeof routeGroup.id === "number") {
      setActiveRouteGroupId(routeGroup.id);
      rememberRouteGroupForPlan(planId, routeGroup.id);
    }

    return {
      ok: true,
      routeGroup: {
        ...routeGroup,
        client_id: routeGroup.client_id || clientId,
      },
    };
  } catch (error) {
    removeRouteGroup(clientId);
    setActiveRouteGroupId(null);
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Route group could not be created.",
    };
  }
};
