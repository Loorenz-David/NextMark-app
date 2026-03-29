import { cn } from "@/lib/utils/cn";
import type { ZoneSelectorItem, ZoneSelectorRowViewModel } from "@/features/zone/domain/zoneSelector.domain";

import { ZoneSelectorRow } from "./ZoneSelectorRow";

type ZoneSelectorListProps<TZone extends ZoneSelectorItem> = {
  rows: ZoneSelectorRowViewModel<TZone>[];
  emptyStateMessage: string;
  listClassName?: string;
  onPressRow: (row: ZoneSelectorRowViewModel<TZone>) => void;
};

export const ZoneSelectorList = <TZone extends ZoneSelectorItem>({
  rows,
  emptyStateMessage,
  listClassName,
  onPressRow,
}: ZoneSelectorListProps<TZone>) => (
  <div
    className={cn(
      "overflow-y-auto scroll-thin rounded-lg border border-[var(--color-border)]/60 bg-[var(--color-page)]/50",
      listClassName,
    )}
  >
    {rows.length === 0 ? (
      <div className="px-3 py-6 text-center text-xs text-[var(--color-muted)]">
        {emptyStateMessage}
      </div>
    ) : (
      <div className="flex flex-col">
        {rows.map((row) => (
          <ZoneSelectorRow
            key={row.selectionKey}
            row={row}
            onPress={onPressRow}
          />
        ))}
      </div>
    )}
  </div>
);
