import type {
  ZoneSelectorItem,
  ZoneSelectorMode,
} from "@/features/zone/domain/zoneSelector.domain";
import type {
  ZoneQueryExactFilters,
  ZoneQuerySearchColumn,
} from "@/features/zone/domain/zoneSearch.domain";

export type ZoneSelectorProps<TZone extends ZoneSelectorItem = ZoneSelectorItem> = {
  versionId?: number | null;
  zones: TZone[];
  selectedZones?: TZone[];
  mode?: ZoneSelectorMode;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
  onSelectZone: (zone: TZone) => void;
  onDeselectZone?: (zone: TZone) => void;
  visibleLimit?: number;
  placeholder?: string;
  className?: string;
  listClassName?: string;
};
