import { useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api/ApiClient";

import { searchZonesQuery } from "../actions/searchZones.query";
import {
  buildFallbackZoneSearchResult,
  shouldRunZoneSearch,
  type ZoneQueryExactFilters,
  type ZoneQuerySearchColumn,
  type ZoneSearchResult,
} from "../domain/zoneSearch.domain";
import type { ZoneSelectorItem } from "../domain/zoneSelector.domain";

type UseZoneSearchFlowParams<TZone extends ZoneSelectorItem> = {
  versionId?: number | null;
  initialZones: TZone[];
  limit: number;
  debounceMs?: number;
  selectedColumns?: ZoneQuerySearchColumn[];
  filters?: ZoneQueryExactFilters;
};

type ZoneSearchFlowState<TZone extends ZoneSelectorItem> = {
  searchValue: string;
  displayedZones: TZone[];
  source: ZoneSearchResult<TZone>["source"];
  isLoading: boolean;
  error: string | null;
  setSearchValue: (value: string) => void;
};

export const useZoneSearchFlow = <TZone extends ZoneSelectorItem>({
  versionId,
  initialZones,
  limit,
  debounceMs = 250,
  selectedColumns = [],
  filters = {},
}: UseZoneSearchFlowParams<TZone>): ZoneSearchFlowState<TZone> => {
  const [searchValue, setSearchValue] = useState("");
  const [remoteZones, setRemoteZones] = useState<TZone[]>([]);
  const [source, setSource] = useState<ZoneSearchResult<TZone>["source"]>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const zoneTypeFilter = filters.zone_type ?? null;
  const isActiveFilter = filters.is_active;
  const cityKeyFilter = filters.city_key?.trim() ?? "";
  const normalizedSelectedColumns = useMemo(
    () => [...selectedColumns],
    [selectedColumns],
  );
  const normalizedFilters = useMemo<ZoneQueryExactFilters>(
    () => ({
      ...(zoneTypeFilter ? { zone_type: zoneTypeFilter } : {}),
      ...(typeof isActiveFilter === "boolean"
        ? { is_active: isActiveFilter }
        : {}),
      ...(cityKeyFilter ? { city_key: cityKeyFilter } : {}),
    }),
    [cityKeyFilter, isActiveFilter, zoneTypeFilter],
  );

  const fallbackResult = useMemo(
    () =>
      buildFallbackZoneSearchResult(
        initialZones,
        searchValue,
        limit,
        normalizedSelectedColumns,
        normalizedFilters,
      ),
    [
      initialZones,
      limit,
      normalizedFilters,
      normalizedSelectedColumns,
      searchValue,
    ],
  );

  useEffect(() => {
    const trimmedValue = searchValue.trim();
    const hasRemoteContext = typeof versionId === "number";
    const hasExactFilters =
      Boolean(zoneTypeFilter) ||
      typeof isActiveFilter === "boolean" ||
      Boolean(cityKeyFilter);

    if (!shouldRunZoneSearch(trimmedValue) && !hasExactFilters) {
      setRemoteZones([]);
      setSource("initial");
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!hasRemoteContext) {
      setRemoteZones([]);
      setSource("fallback");
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await searchZonesQuery({
          versionId,
          input: trimmedValue,
          limit,
          selectedColumns: normalizedSelectedColumns,
          filters: normalizedFilters,
          signal: controller.signal,
        });

        setRemoteZones(results as TZone[]);
        setSource("remote");
      } catch (searchError) {
        if (controller.signal.aborted) {
          return;
        }

        setRemoteZones([]);
        setSource("fallback");

        const message = searchError instanceof ApiError
          ? searchError.message
          : "Unable to query zones.";

        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    cityKeyFilter,
    debounceMs,
    isActiveFilter,
    limit,
    normalizedFilters,
    normalizedSelectedColumns,
    searchValue,
    versionId,
    zoneTypeFilter,
  ]);

  const hasActiveSearch = shouldRunZoneSearch(searchValue);
  const hasExactFilters =
    Boolean(zoneTypeFilter) ||
    typeof isActiveFilter === "boolean" ||
    Boolean(cityKeyFilter);

  if (!hasActiveSearch && !hasExactFilters) {
    return {
      searchValue,
      displayedZones: fallbackResult.zones,
      source: fallbackResult.source,
      isLoading: false,
      error: null,
      setSearchValue,
    };
  }

  if (source === "remote") {
    return {
      searchValue,
      displayedZones: remoteZones.slice(0, Math.max(limit, 0)),
      source,
      isLoading,
      error,
      setSearchValue,
    };
  }

  return {
    searchValue,
    displayedZones: fallbackResult.zones,
    source: fallbackResult.source,
    isLoading,
    error,
    setSearchValue,
  };
};
