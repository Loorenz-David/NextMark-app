import { SearchFilterBar } from "@/shared/searchBars";
import { cn } from "@/lib/utils/cn";
import { useZoneSelectorController } from "@/features/zone/controllers/useZoneSelectorController";
import type { ZoneSelectorItem } from "@/features/zone/domain/zoneSelector.domain";

import { ZoneSelectorList } from "./ZoneSelectorList";
import type { ZoneSelectorProps } from "./ZoneSelector.types";

const DEFAULT_VISIBLE_LIMIT = 8;

export const ZoneSelector = <TZone extends ZoneSelectorItem>({
  versionId,
  zones,
  selectedZones = [],
  mode = "single",
  selectedColumns = [],
  filters = {},
  onSelectZone,
  onDeselectZone,
  visibleLimit = DEFAULT_VISIBLE_LIMIT,
  placeholder = "Search zones...",
  className,
  listClassName,
}: ZoneSelectorProps<TZone>) => {
  const controller = useZoneSelectorController({
    versionId,
    zones,
    selectedZones,
    mode,
    visibleLimit,
    selectedColumns,
    filters,
    onSelectZone,
    onDeselectZone,
  });

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <SearchFilterBar
        placeholder={placeholder}
        applySearch={controller.setSearchValue}
        searchValue={controller.searchValue}
        hideFilteredIcon
      />

      <div className="flex items-center justify-between gap-3 px-1 text-[11px] text-[var(--color-muted)]">
        <span>
          Showing {controller.visibleRows.length} of {controller.filteredCount} zone
          {controller.filteredCount === 1 ? "" : "s"}
        </span>

        {controller.showResultsLimitHint ? (
          <span>
            Refine search to see the remaining {controller.filteredCount - controller.visibleRows.length}.
          </span>
        ) : null}
      </div>

      {controller.searchStatusMessage ? (
        <div className="rounded-xl border border-[var(--color-border-accent)] bg-[var(--color-page)]/70 px-3 py-2 text-[11px] text-[var(--color-muted)]">
          {controller.searchStatusMessage}
        </div>
      ) : null}

      <ZoneSelectorList
        rows={controller.visibleRows}
        emptyStateMessage={controller.emptyStateMessage}
        listClassName={listClassName}
        onPressRow={controller.handleZonePress}
      />
    </div>
  );
};
