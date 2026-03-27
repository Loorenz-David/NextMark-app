import { useEffect, useState } from "react";

import type { ZoneTemplate, ZoneTemplateConfig } from "@/features/zone/types";

type ZoneTemplateFormProps = {
  initialTemplate?: ZoneTemplate | null;
  isSubmitting?: boolean;
  onSubmit: (payload: {
    name: string;
    config_json: ZoneTemplateConfig;
  }) => void | Promise<void>;
};

const toNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
};

export const ZoneTemplateForm = ({
  initialTemplate,
  isSubmitting = false,
  onSubmit,
}: ZoneTemplateFormProps) => {
  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [vehicleTypeId, setVehicleTypeId] = useState(
    initialTemplate?.config_json?.vehicle_type_id == null
      ? ""
      : String(initialTemplate.config_json.vehicle_type_id),
  );
  const [serviceTimeSeconds, setServiceTimeSeconds] = useState(
    initialTemplate?.config_json?.default_service_time_seconds == null
      ? ""
      : String(initialTemplate.config_json.default_service_time_seconds),
  );
  const [depotId, setDepotId] = useState(
    initialTemplate?.config_json?.depot_id == null
      ? ""
      : String(initialTemplate.config_json.depot_id),
  );
  const [maxStops, setMaxStops] = useState(
    initialTemplate?.config_json?.max_stops == null
      ? ""
      : String(initialTemplate.config_json.max_stops),
  );

  useEffect(() => {
    setName(initialTemplate?.name ?? "");
    setVehicleTypeId(
      initialTemplate?.config_json?.vehicle_type_id == null
        ? ""
        : String(initialTemplate.config_json.vehicle_type_id),
    );
    setServiceTimeSeconds(
      initialTemplate?.config_json?.default_service_time_seconds == null
        ? ""
        : String(initialTemplate.config_json.default_service_time_seconds),
    );
    setDepotId(
      initialTemplate?.config_json?.depot_id == null
        ? ""
        : String(initialTemplate.config_json.depot_id),
    );
    setMaxStops(
      initialTemplate?.config_json?.max_stops == null
        ? ""
        : String(initialTemplate.config_json.max_stops),
    );
  }, [initialTemplate]);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          name: name.trim(),
          config_json: {
            vehicle_type_id: toNumberOrNull(vehicleTypeId),
            default_service_time_seconds: toNumberOrNull(serviceTimeSeconds),
            depot_id: toNumberOrNull(depotId),
            max_stops: toNumberOrNull(maxStops),
          },
        });
      }}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Template Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="Downtown Vans"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Vehicle Type ID
          <input
            value={vehicleTypeId}
            onChange={(event) => setVehicleTypeId(event.target.value)}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="101"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Service Time (seconds)
          <input
            value={serviceTimeSeconds}
            onChange={(event) => setServiceTimeSeconds(event.target.value)}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="120"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Depot ID
          <input
            value={depotId}
            onChange={(event) => setDepotId(event.target.value)}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="12"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-white/80">
          Max Stops
          <input
            value={maxStops}
            onChange={(event) => setMaxStops(event.target.value)}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
            placeholder="40"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md border border-[var(--color-light-blue)] bg-[var(--color-light-blue)]/15 px-4 py-2 text-sm font-semibold text-[var(--color-light-blue)] transition hover:bg-[var(--color-light-blue)]/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Save Template"}
      </button>
    </form>
  );
};
