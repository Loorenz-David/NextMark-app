import { Field } from "@/shared/inputs/FieldContainer";
import type { SelectableZone } from "../PlanForm.types";

type ZoneSelectionStepProps = {
  availableZones: SelectableZone[];
  isZonesLoading: boolean;
  selectedZoneIds: number[];
  onZoneSelectionToggle: (zoneId: number, checked: boolean) => void;
};

export const ZoneSelectionStep = ({
  availableZones,
  isZonesLoading,
  selectedZoneIds,
  onZoneSelectionToggle,
}: ZoneSelectionStepProps) => {
  return (
    <div className="border-t border-[var(--color-border-accent)] px-3 py-2">
      <Field label="Zones (optional):">
        {isZonesLoading ? (
          <p className="rounded-md border border-[var(--color-border-accent)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            Loading available zones...
          </p>
        ) : availableZones.length === 0 ? (
          <p className="rounded-md border border-[var(--color-border-accent)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
            No zones available. You can create the plan now and materialize
            route groups later.
          </p>
        ) : (
          <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border border-[var(--color-border-accent)] px-3 py-2">
            {availableZones.map((zone) => {
              const checked = selectedZoneIds.includes(zone.id);
              return (
                <label
                  key={zone.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      onZoneSelectionToggle(zone.id, event.target.checked)
                    }
                  />
                  <span>{zone.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </Field>
      <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
        If zone IDs are provided, route groups are materialized immediately
        after plan creation. Leave empty to create the plan now and materialize
        route groups later.
      </p>
    </div>
  );
};
