import type { RouteGroupRailItem } from "./types";

type RouteGroupRailPopoverContentProps = {
  item: RouteGroupRailItem;
};

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-4 text-xs">
    <span className="text-[rgb(220,248,243)]/72">{label}</span>
    <span className="text-right font-medium text-[rgb(232,255,251)]">
      {value}
    </span>
  </div>
);

export const RouteGroupRailPopoverContent = ({
  item,
}: RouteGroupRailPopoverContentProps) => {
  return (
    <div className="w-56 rounded-[20px] border border-[rgba(112,222,208,0.24)] bg-[linear-gradient(135deg,rgba(72,180,194,0.18),rgba(111,224,207,0.07))] p-3 text-sm text-[rgb(232,255,251)] shadow-[0_18px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="mb-3 flex flex-col gap-1">
        <div className="text-sm font-semibold text-[rgb(232,255,251)]">
          {item.label}
        </div>
        <div className="text-[11px] text-[rgb(220,248,243)]/78">
          {item.zoneLabel ?? "Route group"}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SummaryRow
          label="Completion"
          value={`${Math.round(item.completionRatio)}%`}
        />
        <SummaryRow label="Orders" value={`${item.orderCount}`} />
        <SummaryRow label="Solutions" value={`${item.routeSolutionCount}`} />
        <SummaryRow
          label="State"
          value={item.stateLabel ?? "Unknown"}
        />
      </div>
    </div>
  );
};
