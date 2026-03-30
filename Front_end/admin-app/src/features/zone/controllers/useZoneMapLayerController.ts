import { useEffect, useMemo, useState } from "react";

import { useShallow } from "zustand/react/shallow";

import { mapZoneStateToRenderableDefinition } from "@/features/zone/domain/zoneState.mapper";
import { selectWorkingZoneVersionId, useZoneVersionStore } from "@/features/zone/store/zoneVersion.store";
import {
  selectIsZoneMode,
  selectZonePathEditSession,
  selectVisibleZones,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import {
  selectZoneVisibility,
  useZoneVisibilityStore,
} from "@/features/zone/store/zoneVisibility.store";
import type { MapBounds } from "@/shared/map/domain/types";
import { useMapManager } from "@/shared/resource-manager/useResourceManager";

export const useZoneMapLayerController = () => {
  const mapManager = useMapManager();
  const [viewportBounds, setViewportBounds] = useState<MapBounds | null>(null);
  const [mapReadyTick, setMapReadyTick] = useState(0);

  const isZoneMode = useZoneStore(selectIsZoneMode);
  const pathEditSession = useZoneStore(selectZonePathEditSession);
  const workingVersionId = useZoneVersionStore(selectWorkingZoneVersionId);
  const closeZoneDetailsPopover = useZoneStore(
    (state) => state.closeZoneDetailsPopover,
  );
  const toggleZoneDetailsPopover = useZoneStore(
    (state) => state.toggleZoneDetailsPopover,
  );
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
    return mapManager.subscribeReady(() => {
      setMapReadyTick((tick) => tick + 1);
    });
  }, [mapManager]);

  useEffect(() => {
    if (!pathEditSession) {
      return;
    }

    closeZoneDetailsPopover();
  }, [closeZoneDetailsPopover, pathEditSession]);

  useEffect(() => {
    if (!shouldRenderZones) {
      closeZoneDetailsPopover();
      mapManager.clearZoneLayer();
      return;
    }

    mapManager.setZoneLayer(renderableZones, {
      onClick: () => {
        if (pathEditSession) {
          return;
        }
        closeZoneDetailsPopover();
      },
      onLabelClick: (zoneId, anchorRect) => {
        if (pathEditSession) {
          return;
        }
        toggleZoneDetailsPopover({ zoneId, anchorRect });
      },
    });

    return () => {
      mapManager.clearZoneLayer();
    };
  }, [
    isZoneMode,
    mapManager,
    renderableZones,
    closeZoneDetailsPopover,
    pathEditSession,
    shouldRenderZones,
    toggleZoneDetailsPopover,
    mapReadyTick,
  ]);
};
