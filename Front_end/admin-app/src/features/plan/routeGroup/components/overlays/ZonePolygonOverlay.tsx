import { useEffect } from "react";

import {
  selectZoneVisibility,
  useZoneVisibilityStore,
} from "@/features/zone/store/zoneVisibility.store";
import { useMapManager } from "@/shared/resource-manager/useResourceManager";
import { useActiveRouteGroupId } from "../../store/useActiveRouteGroup.selector";
import { useRouteGroupByServerId } from "../../store/useRouteGroup.selector";

export const ZonePolygonOverlay = () => {
  const mapManager = useMapManager();
  const activeRouteGroupId = useActiveRouteGroupId();
  const routeGroup = useRouteGroupByServerId(activeRouteGroupId);
  const isZoneVisible = useZoneVisibilityStore(selectZoneVisibility);

  const zoneGeometry = routeGroup?.zone_snapshot?.geometry ?? null;
  const zoneLabel =
    routeGroup?.zone_snapshot?.name?.trim() ||
    (typeof routeGroup?.zone_id === "number"
      ? `Zone ${routeGroup.zone_id}`
      : null);

  useEffect(() => {
    if (!isZoneVisible || !zoneGeometry) {
      mapManager.clearZonePolygonOverlay();
      return;
    }

    mapManager.setZonePolygonOverlay(zoneGeometry, {
      label: zoneLabel,
    });

    return () => {
      mapManager.clearZonePolygonOverlay();
    };
  }, [isZoneVisible, mapManager, zoneGeometry, zoneLabel]);

  return null;
};
