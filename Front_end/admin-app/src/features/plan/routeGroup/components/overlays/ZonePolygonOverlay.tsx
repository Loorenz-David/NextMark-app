import { useEffect } from "react";

import { useMapManager } from "@/shared/resource-manager/useResourceManager";
import { useActiveRouteGroupId } from "../../store/useActiveRouteGroup.selector";
import { useRouteGroupByServerId } from "../../store/useRouteGroup.selector";

export const ZonePolygonOverlay = () => {
  const mapManager = useMapManager();
  const activeRouteGroupId = useActiveRouteGroupId();
  const routeGroup = useRouteGroupByServerId(activeRouteGroupId);

  const zoneGeometry = routeGroup?.zone_geometry_snapshot ?? null;

  useEffect(() => {
    mapManager.setZonePolygonOverlay(zoneGeometry);

    return () => {
      mapManager.clearZonePolygonOverlay();
    };
  }, [mapManager, zoneGeometry]);

  return null;
};
