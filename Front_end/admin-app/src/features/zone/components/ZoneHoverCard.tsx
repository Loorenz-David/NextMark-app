import { useMemo } from "react";

import {
  selectWorkingZoneVersion,
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";

type ZoneHoverCardProps = {
  zoneId: number | null;
};

export const ZoneHoverCard = ({ zoneId }: ZoneHoverCardProps) => {
  const workingVersion = useZoneStore(selectWorkingZoneVersion);
  const zone = useZoneStore((state) =>
    selectZoneByVersionAndId(state, workingVersion?.id, zoneId),
  );

  const config = useMemo(
    () => zone?.template_full?.config_json ?? null,
    [zone],
  );

  if (!zone) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10 w-56 rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-page)]/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-2 text-sm font-semibold text-[var(--color-muted)]">
        {zone.name}
      </p>
      <div className="space-y-1 text-xs text-[var(--color-muted)]/70">
        {config?.vehicle_type_id != null ? (
          <p>Vehicle type: {config.vehicle_type_id}</p>
        ) : null}
        {config?.max_stops != null ? (
          <p>Max stops: {config.max_stops}</p>
        ) : null}
        {config?.depot_id != null ? <p>Depot: {config.depot_id}</p> : null}
        {config?.default_service_time_seconds != null ? (
          <p>Service time: {config.default_service_time_seconds}s</p>
        ) : null}
        {!config ? (
          <p className="text-[var(--color-muted)]/40">No defaults configured</p>
        ) : null}
      </div>
    </div>
  );
};
