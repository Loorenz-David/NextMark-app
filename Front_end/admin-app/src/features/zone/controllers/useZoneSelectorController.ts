import { useMemo } from "react";
import { useZoneSearchFlow } from "@/features/zone/flows/useZoneSearch.flow";

import {
  buildZoneSelectorRows,
  type ZoneSelectorItem,
  type ZoneSelectorMode,
  type ZoneSelectorRowViewModel,
} from "@/features/zone/domain/zoneSelector.domain";
import type {
  ZoneQueryExactFilters,
  ZoneQuerySearchColumn,
} from "@/features/zone/domain/zoneSearch.domain";

type UseZoneSelectorControllerParams<TZone extends ZoneSelectorItem> = {
  versionId?: number | null;
  zones: TZone[];
  selectedZones: TZone[];
  mode: ZoneSelectorMode;
  visibleLimit: number;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
  onSelectZone: (zone: TZone) => void;
  onDeselectZone?: (zone: TZone) => void;
};

export type ZoneSelectorViewModel<TZone extends ZoneSelectorItem = ZoneSelectorItem> = {
  searchValue: string;
  visibleRows: ZoneSelectorRowViewModel<TZone>[];
  totalCount: number;
  filteredCount: number;
  showResultsLimitHint: boolean;
  emptyStateMessage: string;
  searchSource: "initial" | "remote" | "fallback";
  searchStatusMessage: string | null;
  isLoading: boolean;
  setSearchValue: (value: string) => void;
  handleZonePress: (row: ZoneSelectorRowViewModel<TZone>) => void;
};

export const useZoneSelectorController = <TZone extends ZoneSelectorItem>({
  versionId,
  zones,
  selectedZones,
  mode,
  visibleLimit,
  selectedColumns = [],
  filters = {},
  onSelectZone,
  onDeselectZone,
}: UseZoneSelectorControllerParams<TZone>): ZoneSelectorViewModel<TZone> => {
  const {
    searchValue,
    displayedZones,
    source,
    isLoading,
    error,
    setSearchValue,
  } = useZoneSearchFlow({
    versionId,
    initialZones: zones,
    limit: visibleLimit,
    selectedColumns,
    filters,
  });

  const visibleRows = useMemo(
    () => buildZoneSelectorRows(displayedZones, selectedZones, mode),
    [displayedZones, mode, selectedZones],
  );
  const hasActiveSearch = searchValue.trim().length > 0;
  const filteredCount = displayedZones.length;
  const showResultsLimitHint = !hasActiveSearch && zones.length > visibleRows.length;

  const emptyStateMessage = (() => {
    if (zones.length === 0) {
      return "No zones available.";
    }

    if (isLoading) {
      return "Searching zones...";
    }

    if (visibleRows.length === 0) {
      return "No zones match the current search.";
    }

    return "";
  })();

  const searchStatusMessage = (() => {
    if (isLoading) {
      return "Searching zones...";
    }

    if (error && source === "fallback") {
      return versionId == null
        ? "Showing local matches until a zone version is provided."
        : "Showing fallback matches because the zone query failed.";
    }

    return null;
  })();

  return {
    searchValue,
    visibleRows,
    totalCount: zones.length,
    filteredCount,
    showResultsLimitHint,
    emptyStateMessage,
    searchSource: source,
    searchStatusMessage,
    isLoading,
    setSearchValue,
    handleZonePress: (row) => {
      if (row.isSelected && mode === "multi") {
        onDeselectZone?.(row.zone);
        return;
      }

      if (row.isDisabled) {
        return;
      }

      onSelectZone(row.zone);
    },
  };
};
