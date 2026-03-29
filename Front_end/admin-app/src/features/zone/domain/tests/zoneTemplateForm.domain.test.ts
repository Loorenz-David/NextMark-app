import {
  buildZoneTemplatePayload,
  validateZoneTemplatePayload,
} from "../zoneTemplateForm.domain";

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const runZoneTemplateFormDomainTests = () => {
  const payload = buildZoneTemplatePayload({
    template_name: "Chelsea Standard",
    default_facility_id: "5",
    max_orders_per_route: "15",
    max_vehicles: "3",
    operating_window_start: "08:00",
    operating_window_end: "18:00",
    eta_tolerance_seconds: "300",
    vehicle_capabilities_required: "cold_chain, fragile",
    preferred_vehicle_ids: "10, 11",
    default_route_end_strategy: "last_stop",
  });

  assert(payload, "payload should be created when values are present");
  assert(payload?.default_route_end_strategy === "end_at_last_stop", "last_stop should normalize");
  assert(payload?.preferred_vehicle_ids?.length === 2, "preferred vehicle ids should parse");

  const invalidTimeWindow = validateZoneTemplatePayload({
    name: "Invalid",
    operating_window_start: "18:00",
    operating_window_end: "08:00",
  });
  assert(!invalidTimeWindow.valid, "end time before start should be invalid");

  const invalidCapability = validateZoneTemplatePayload({
    name: "Invalid",
    vehicle_capabilities_required: ["unknown_capability"],
  });
  assert(!invalidCapability.valid, "unknown capability should be invalid");
};
