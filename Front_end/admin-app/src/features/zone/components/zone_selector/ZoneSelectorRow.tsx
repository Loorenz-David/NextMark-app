import { cn } from "@/lib/utils/cn";
import type { ZoneSelectorItem, ZoneSelectorRowViewModel } from "@/features/zone/domain/zoneSelector.domain";

type ZoneSelectorRowProps<TZone extends ZoneSelectorItem> = {
  row: ZoneSelectorRowViewModel<TZone>;
  onPress: (row: ZoneSelectorRowViewModel<TZone>) => void;
};

export const ZoneSelectorRow = <TZone extends ZoneSelectorItem>({
  row,
  onPress,
}: ZoneSelectorRowProps<TZone>) => (
  <button
    type="button"
    onClick={() => onPress(row)}
    disabled={row.isDisabled}
    className={cn(
      "flex w-full items-start gap-3 border-b border-[var(--color-border)]/40 px-3 py-3 text-left transition-colors last:border-b-0",
      row.isDisabled
        ? "cursor-not-allowed bg-[rgb(var(--color-light-blue-r),0.08)]"
        : row.isSelected
          ? "cursor-pointer bg-[rgb(var(--color-light-blue-r),0.06)] hover:bg-[rgb(var(--color-light-blue-r),0.1)]"
          : "cursor-pointer hover:bg-[var(--color-muted)]/10",
    )}
  >
    <div
      className={cn(
        "mt-0.5 h-3 w-3 shrink-0 rounded-full border",
        row.isSelected
          ? "border-[rgb(var(--color-light-blue-r))] bg-[rgb(var(--color-light-blue-r))]"
          : "border-[var(--color-muted)]/60 bg-transparent",
      )}
    />

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "min-w-0 flex-1 break-words text-sm font-medium leading-4",
            row.isSelected ? "text-[rgb(var(--color-light-blue-r))]" : "text-[var(--color-text)]",
          )}
        >
          {row.title}
        </span>

        {row.isSelected ? (
          <span className="shrink-0 rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgb(var(--color-light-blue-r),0.12)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[rgb(var(--color-light-blue-r))]">
            Selected
          </span>
        ) : null}
      </div>

      <span className="mt-1 block text-[11px] text-[var(--color-muted)]">
        {row.subtitle}
      </span>
    </div>
  </button>
);
