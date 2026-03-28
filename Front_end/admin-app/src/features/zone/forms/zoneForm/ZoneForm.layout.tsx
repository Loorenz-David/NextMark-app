import { useEffect, useMemo, useRef, useState } from "react";

import { BasicButton } from "@/shared/buttons/BasicButton";
import { FeaturePopupFooter } from "@/shared/popups/featurePopup";
import { Cell, SplitRow } from "@/shared/layout/cells";
import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";

export type ZoneFormFields = {
  name: string;
  vehicle_type_id: string;
  default_service_time_seconds: string;
  depot_id: string;
  max_stops: string;
};

export type ZoneFormLayoutProps = {
  initialValues: Partial<ZoneFormFields>;
  isSubmitting: boolean;
  isDeleting?: boolean;
  onSubmit: (fields: ZoneFormFields) => void;
  onDelete?: () => void;
  onCancel: () => void;
  submitLabel: string;
};

const getInitialFieldValues = (
  initialValues: Partial<ZoneFormFields>,
): ZoneFormFields => ({
  name: initialValues.name ?? "",
  vehicle_type_id: initialValues.vehicle_type_id ?? "",
  default_service_time_seconds:
    initialValues.default_service_time_seconds ?? "",
  depot_id: initialValues.depot_id ?? "",
  max_stops: initialValues.max_stops ?? "",
});

export const ZoneFormLayout = ({
  initialValues,
  isSubmitting,
  isDeleting = false,
  onSubmit,
  onDelete,
  onCancel,
  submitLabel,
}: ZoneFormLayoutProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const resolvedInitial = useMemo(
    () => getInitialFieldValues(initialValues),
    [initialValues],
  );

  const [name, setName] = useState(resolvedInitial.name);
  const [vehicleTypeId, setVehicleTypeId] = useState(
    resolvedInitial.vehicle_type_id,
  );
  const [defaultServiceTimeSeconds, setDefaultServiceTimeSeconds] = useState(
    resolvedInitial.default_service_time_seconds,
  );
  const [depotId, setDepotId] = useState(resolvedInitial.depot_id);
  const [maxStops, setMaxStops] = useState(resolvedInitial.max_stops);

  useEffect(() => {
    setName(resolvedInitial.name);
    setVehicleTypeId(resolvedInitial.vehicle_type_id);
    setDefaultServiceTimeSeconds(resolvedInitial.default_service_time_seconds);
    setDepotId(resolvedInitial.depot_id);
    setMaxStops(resolvedInitial.max_stops);
  }, [resolvedInitial]);

  return (
    <>
      <form
        ref={formRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-ligth-bg)] px-4 pt-4 scroll-thin h-full pb-[84px]"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            name,
            vehicle_type_id: vehicleTypeId,
            default_service_time_seconds: defaultServiceTimeSeconds,
            depot_id: depotId,
            max_stops: maxStops,
          });
        }}
      >
        <div className="mb-4 rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-sm">
          <Cell>
            <Field label="Zone name:" required warningPlacement="besidesLabel">
              <InputField
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
            <Cell>
              <Field label="Vehicle type ID:" warningPlacement="besidesLabel">
                <InputField
                  type="number"
                  value={vehicleTypeId}
                  onChange={(event) => setVehicleTypeId(event.target.value)}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </Cell>
            <Cell>
              <Field
                label="Service time (seconds):"
                warningPlacement="besidesLabel"
              >
                <InputField
                  type="number"
                  value={defaultServiceTimeSeconds}
                  onChange={(event) =>
                    setDefaultServiceTimeSeconds(event.target.value)
                  }
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </Cell>
          </SplitRow>

          <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
            <Cell>
              <Field label="Depot ID:" warningPlacement="besidesLabel">
                <InputField
                  type="number"
                  value={depotId}
                  onChange={(event) => setDepotId(event.target.value)}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </Cell>
            <Cell>
              <Field label="Max stops:" warningPlacement="besidesLabel">
                <InputField
                  type="number"
                  value={maxStops}
                  onChange={(event) => setMaxStops(event.target.value)}
                  fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                  inputClassName={PLAIN_INPUT_CLASS}
                />
              </Field>
            </Cell>
          </SplitRow>
        </div>
      </form>

      <FeaturePopupFooter>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting || isSubmitting}
            className="rounded-xl border border-red-500/70 px-3 py-1.5 text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? "Deleting..." : "Delete Zone"}
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <BasicButton
            params={{
              variant: "secondary",
              onClick: onCancel,
              disabled: isSubmitting || isDeleting,
              ariaLabel: "Cancel zone form",
            }}
          >
            Cancel
          </BasicButton>
          <BasicButton
            params={{
              variant: "primary",
              onClick: () => formRef.current?.requestSubmit(),
              disabled: isSubmitting || isDeleting,
              ariaLabel: submitLabel,
            }}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </BasicButton>
        </div>
      </FeaturePopupFooter>
    </>
  );
};
