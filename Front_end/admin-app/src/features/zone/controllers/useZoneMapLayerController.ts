import { useEffect, useMemo, useState } from "react";

import { useShallow } from "zustand/react/shallow";

import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import {
  selectIsZoneMode,
  selectVisibleZones,
  selectWorkingZoneVersionId,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import {
  selectZoneVisibility,
  useZoneVisibilityStore,
} from "@/features/zone/store/zoneVisibility.store";
import type { MapBounds } from "@/shared/map/domain/types";
import {
  useMapManager,
  usePopupManager,
} from "@/shared/resource-manager/useResourceManager";

export const useZoneMapLayerController = () => {
  const mapManager = useMapManager();
  const popupManager = usePopupManager();
  const [viewportBounds, setViewportBounds] = useState<MapBounds | null>(null);

  const isZoneMode = useZoneStore(selectIsZoneMode);
  const workingVersionId = useZoneStore(selectWorkingZoneVersionId);
  const setHoveredZoneId = useZoneStore((state) => state.setHoveredZoneId);
  const setSelectedZoneId = useZoneStore((state) => state.setSelectedZoneId);
  const isZoneVisible = useZoneVisibilityStore(selectZoneVisibility);
  const visibleZones = useZoneStore(
    useShallow((state) =>
      selectVisibleZones(state, workingVersionId, viewportBounds),
    ),
  );

  const renderableZones = useMemo(
    () => visibleZones.map(mapZoneStateToRenderableDefinition),
    [visibleZones],
  );
  const shouldRenderZones = isZoneMode || isZoneVisible;

  useEffect(() => {
    return mapManager.subscribeBoundsChanged((bounds) => {
      setViewportBounds(bounds);
    });
  }, [mapManager]);

  useEffect(() => {
    if (!shouldRenderZones) {
      setHoveredZoneId(null);
      mapManager.clearZoneLayer();
      return;
    }

    mapManager.setZoneLayer(renderableZones, {
      onHover: setHoveredZoneId,
      onClick: (zoneId) => {
        if (!isZoneMode || typeof workingVersionId !== "number") {
          return;
        }

        setSelectedZoneId(zoneId, workingVersionId);
        popupManager.open({
          key: "zone.form",
          payload: { mode: "edit", zoneId, versionId: workingVersionId },
        });
      },
    });

    return () => {
      mapManager.clearZoneLayer();
    };
  }, [
    isZoneMode,
    mapManager,
    popupManager,
    renderableZones,
    setHoveredZoneId,
    setSelectedZoneId,
    shouldRenderZones,
    workingVersionId,
  ]);
};
