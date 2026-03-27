import { useZoneStore } from "@/features/zone/store/zone.store";
import type { ZonesContext } from "@/features/zone/types";

export const insertZonesFromBootstrap = (zonesContext: ZonesContext) => {
  if (
    typeof zonesContext?.version_id !== "number" ||
    !Array.isArray(zonesContext.zones)
  ) {
    return;
  }

  useZoneStore
    .getState()
    .replaceZoneLitesForVersion(zonesContext.version_id, zonesContext.zones);
};
