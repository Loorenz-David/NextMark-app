import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { useZonePathEditController } from "@/features/zone/controllers/useZonePathEditController";
import { useEnsureZoneTemplate } from "@/features/zone/controllers/useEnsureZoneTemplate";
import {
  selectWorkingZoneVersionId,
  selectWorkingZoneVersion,
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import { usePopupManager } from "@/shared/resource-manager/useResourceManager";

const POPOVER_WIDTH = 224;
const WINDOW_PADDING = 12;
const VERTICAL_OFFSET = 10;

export const ZoneDetailsPopover = () => {
  const popupManager = usePopupManager();
  const workingVersionId = useZoneStore(selectWorkingZoneVersionId);
  const workingVersion = useZoneStore(selectWorkingZoneVersion);
  const activePopover = useZoneStore((state) => state.activeZoneDetailsPopover);
  const closeZoneDetailsPopover = useZoneStore(
    (state) => state.closeZoneDetailsPopover,
  );
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, workingVersionId, activePopover?.zoneId),
  );
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { load } = useEnsureZoneTemplate(workingVersionId, activePopover?.zoneId);
  const { beginPathEdit } = useZonePathEditController(
    workingVersionId,
    activePopover?.zoneId,
  );

  const config = useMemo(
    () => zone?.template_full?.config_json ?? null,
    [zone],
  );
  const isPathEditDisabled = workingVersion?.is_active === true;

  useEffect(() => {
    if (!activePopover) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current?.contains(event.target as Node)) {
        return;
      }

      closeZoneDetailsPopover();
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [activePopover, closeZoneDetailsPopover]);

  useEffect(() => {
    if (!activePopover || !zone) {
      return;
    }

    if (zone.template_full || zone.is_loading_template || !zone.template_ref) {
      return;
    }

    void load();
  }, [activePopover, load, zone]);

  if (!activePopover || !zone || typeof document === "undefined") {
    return null;
  }

  const { top, left, width, height } = activePopover.anchorRect;
  const unclampedLeft = left + width / 2 - POPOVER_WIDTH / 2;
  const maxLeft = Math.max(WINDOW_PADDING, window.innerWidth - POPOVER_WIDTH - WINDOW_PADDING);
  const clampedLeft = Math.min(Math.max(unclampedLeft, WINDOW_PADDING), maxLeft);
  const popoverTop = top + height + VERTICAL_OFFSET;

  return createPortal(
    <div
      ref={popoverRef}
      className="pointer-events-auto fixed z-[1200] w-56 rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm"
      style={{
        top: popoverTop,
        left: clampedLeft,
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-muted)]">
          {zone.name}
        </p>
        {typeof zone.id === "number" && typeof workingVersionId === "number" ? (
          <div className="flex items-center gap-2">
            <BasicButton
              params={{
                variant: "secondary",
                ariaLabel: `Template edit ${zone.name ?? "zone"}`,
                onClick: () => {
                  closeZoneDetailsPopover();
                  popupManager.open({
                    key: "zone.form",
                    payload: {
                      mode: "edit",
                      zoneId: zone.id,
                      versionId: workingVersionId,
                    },
                  });
                },
              }}
            >
              Template Edit
            </BasicButton>
            <BasicButton
              params={{
                variant: "primary",
                ariaLabel: `Path edit ${zone.name ?? "zone"}`,
                disabled: isPathEditDisabled,
                onClick: () => {
                  void beginPathEdit();
                },
              }}
            >
              Path Edit
            </BasicButton>
          </div>
        ) : null}
      </div>
      <div className="space-y-1 text-xs text-[var(--color-muted)]/70">
        {zone.is_loading_template ? (
          <p className="text-[var(--color-muted)]/50">Loading defaults...</p>
        ) : null}
        {!zone.is_loading_template && zone.template_error ? (
          <p className="text-[var(--color-danger,#ef4444)]">
            {zone.template_error}
          </p>
        ) : null}
        {isPathEditDisabled ? (
          <p className="text-[var(--color-muted)]/50">
            Zone boundaries cannot be edited on the active version. Create a
            new draft version to redraw zones.
          </p>
        ) : null}
        {config?.vehicle_type_id != null ? (
          <p>Vehicle type: {config.vehicle_type_id}</p>
        ) : null}
        {config?.max_stops != null ? <p>Max stops: {config.max_stops}</p> : null}
        {config?.depot_id != null ? <p>Depot: {config.depot_id}</p> : null}
        {config?.default_service_time_seconds != null ? (
          <p>Service time: {config.default_service_time_seconds}s</p>
        ) : null}
        {!zone.is_loading_template && !zone.template_error && !config ? (
          <p className="text-[var(--color-muted)]/40">No defaults configured</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
