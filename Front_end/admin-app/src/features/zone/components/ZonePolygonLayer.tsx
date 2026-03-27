import { ZoneHoverCard } from "./ZoneHoverCard";

import { useZoneStore } from "@/features/zone/store/zone.store";

export const ZonePolygonLayer = () => {
  const hoveredZoneId = useZoneStore((state) => state.hoveredZoneId);

  return <ZoneHoverCard zoneId={hoveredZoneId} />;
};
