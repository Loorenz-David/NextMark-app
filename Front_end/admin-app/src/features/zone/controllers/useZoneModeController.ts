import { useCallback, useEffect } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { sessionLocationService } from "@/app/services/sessionLocation.service";
import { zoneApi } from "@/features/zone/api/zone.api";
import {
  selectIsLoadingZonesForVersion,
  selectZonesByVersion,
  selectWorkingZoneVersion,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import type { GeoJSONPolygon } from "@/features/zone/types";
import {
  useMapManager,
  usePopupManager,
} from "@/shared/resource-manager/useResourceManager";

export function useZoneModeController() {
  const mapManager = useMapManager();
  const popupManager = usePopupManager();
  const { showMessage } = useMessageHandler();

  const isZoneMode = useZoneStore((state) => state.isZoneMode);
  const versions = useZoneStore((state) => state.versions);
  const drawnGeometry = useZoneStore((state) => state.drawnGeometry);
  const hoveredZoneId = useZoneStore((state) => state.hoveredZoneId);
  const isLoadingVersions = useZoneStore((state) => state.isLoadingVersions);
  const setIsZoneMode = useZoneStore((state) => state.setIsZoneMode);
  const setDrawnGeometry = useZoneStore((state) => state.setDrawnGeometry);
  const setHoveredZoneId = useZoneStore((state) => state.setHoveredZoneId);
  const replaceZonesForVersion = useZoneStore((state) => state.replaceZonesForVersion);
  const setLoadingZones = useZoneStore((state) => state.setLoadingZones);
  const setVersions = useZoneStore((state) => state.setVersions);
  const setSelectedVersionId = useZoneStore((state) => state.setSelectedVersionId);
  const setLoadingVersions = useZoneStore((state) => state.setLoadingVersions);
  const upsertZone = useZoneStore((state) => state.upsertZone);
  const removeZoneOptimistic = useZoneStore((state) => state.removeZoneOptimistic);
  const workingVersion = useZoneStore(selectWorkingZoneVersion);
  const isLoadingZones = useZoneStore((state) =>
    selectIsLoadingZonesForVersion(state, workingVersion?.id),
  );
  const zonesForWorkingVersionCount = useZoneStore((state) =>
    selectZonesByVersion(state, workingVersion?.id).length,
  );

  // Bootstrap a working zone version directly for zone mode.
  // The map overlay only needs one editable version to work, so we use the
  // backend convenience endpoint instead of depending on the full version list.
  useEffect(() => {
    if (!isZoneMode) return;
    if (versions.length > 0) return;
    if (isLoadingVersions) return;

    const zoneCityKey = sessionLocationService.getZoneCityKey();
    if (!zoneCityKey) {
      showMessage({
        status: 400,
        message: "Missing session city. Complete your account city first.",
      });
      return;
    }

    setLoadingVersions(true);

    zoneApi
      .ensureFirstZoneVersion({
        city_key: zoneCityKey,
      })
      .then((response) => {
        const ensuredVersion = response.data ?? null;

        setVersions(ensuredVersion ? [ensuredVersion] : []);
        setSelectedVersionId(
          typeof ensuredVersion?.id === "number" ? ensuredVersion.id : null,
        );
      })
      .catch(() => {
        showMessage({ status: 500, message: "Failed to load zone versions." });
      })
      .finally(() => {
        setLoadingVersions(false);
      });
  }, [
    isZoneMode,
    isLoadingVersions,
    versions.length,
    setSelectedVersionId,
    setLoadingVersions,
    setVersions,
    showMessage,
  ]);

  useEffect(() => {
    if (!isZoneMode) return;
    if (typeof workingVersion?.id !== "number") return;
    const versionId = workingVersion.id;

    if (zonesForWorkingVersionCount > 0) return;
    if (isLoadingZones) return;

    setLoadingZones(versionId, true);

    zoneApi
      .fetchZonesForVersion(versionId)
      .then((response) => {
        replaceZonesForVersion(
          versionId,
          Array.isArray(response.data) ? response.data : [],
        );
      })
      .catch(() => {
        showMessage({ status: 500, message: "Failed to load zones." });
      })
      .finally(() => {
        setLoadingZones(versionId, false);
      });
  }, [
    isZoneMode,
    isLoadingZones,
    replaceZonesForVersion,
    setLoadingZones,
    workingVersion?.id,
    showMessage,
    zonesForWorkingVersionCount,
  ]);

  useEffect(() => {
    if (!isZoneMode || typeof workingVersion?.id !== "number") {
      mapManager.disableZoneCapture();
      setDrawnGeometry(null);
      return;
    }

    mapManager.enableZoneCapture((geometry: GeoJSONPolygon) => {
      setDrawnGeometry(geometry);
    });

    return () => {
      mapManager.disableZoneCapture();
    };
  }, [isZoneMode, mapManager, setDrawnGeometry, workingVersion?.id]);

  const enterZoneMode = useCallback(() => {
    setIsZoneMode(true);
  }, [setIsZoneMode]);

  const exitZoneMode = useCallback(() => {
    setIsZoneMode(false);
    setDrawnGeometry(null);
    setHoveredZoneId(null);
  }, [setDrawnGeometry, setHoveredZoneId, setIsZoneMode]);

  const discardShape = useCallback(() => {
    setDrawnGeometry(null);
  }, [setDrawnGeometry]);

  const openCreateForm = useCallback(() => {
    if (!drawnGeometry || typeof workingVersion?.id !== "number") return;

    popupManager.open({
      key: "zone.form",
      payload: {
        mode: "create",
        geometry: drawnGeometry,
        versionId: workingVersion.id,
      },
    });
  }, [drawnGeometry, popupManager, workingVersion?.id]);

  return {
    isZoneMode,
    drawnGeometry,
    hoveredZoneId,
    isLoadingZones,
    activeVersion: workingVersion,
    enterZoneMode,
    exitZoneMode,
    discardShape,
    openCreateForm,
    upsertZone,
    removeZoneOptimistic,
  };
}
