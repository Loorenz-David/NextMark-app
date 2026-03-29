import { vehicleCapabilityOptions } from '@/features/infrastructure/domain/infrastructureEnums'
import { FacilitySelector } from '@/features/infrastructure/facility/components'
import { Field } from '@/shared/inputs/FieldContainer'
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from '@/shared/inputs/InputField'
import { OptionPopoverSelect } from '@/shared/inputs/OptionPopoverSelect'
import { Cell, SplitRow } from '@/shared/layout/cells'

import { ALLOWED_ZONE_ROUTE_END_STRATEGIES } from '../../../domain/zoneTemplateForm.domain'
import { useZoneForm } from '../../../popups/ZoneForm/ZoneForm.context'

const SectionHeading = ({
  title,
  description,
}: {
  title: string
  description: string
}) => (
  <div className="flex flex-col gap-1 px-1">
    <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
    <p className="text-xs text-[var(--color-muted)]">{description}</p>
  </div>
)

const routeEndStrategyOptions = ALLOWED_ZONE_ROUTE_END_STRATEGIES.map((value) => ({
  value,
  label: value,
}))

const capabilityOptions = vehicleCapabilityOptions
  .filter((option) => option.value === 'cold_chain' || option.value === 'fragile')
  .map((option) => ({ label: option.label, value: option.value }))

export const ZoneFormFields = () => {
  const { formState, setFormState } = useZoneForm()

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Identity"
            description="Define the zone and its template-level defaults."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Zone name:" required gap={2} warningPlacement="besidesLabel">
              <InputField
                required
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
                placeholder="Downtown Core"
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Template name:" gap={2} warningPlacement="besidesLabel">
              <InputField
                value={formState.template_name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    template_name: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
                placeholder="Chelsea Standard"
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-1 divide-[var(--color-border-accent)] py-2 pr-2">
          <Cell>
            <Field label="Default facility:" gap={2} warningPlacement="besidesLabel">
              <FacilitySelector
                mode="single"
                selectedFacilityIds={
                  formState.default_facility_id ? [formState.default_facility_id] : []
                }
                onSelectionChange={(nextIds) =>
                  setFormState((current) => ({
                    ...current,
                    default_facility_id: String(nextIds[0] ?? ''),
                  }))
                }
                placeholder="Select a facility"
                containerClassName={PLAIN_INPUT_CONTAINER_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Planning Defaults"
            description="Operational limits and routing defaults for this zone template."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Max orders per route:" gap={2} warningPlacement="besidesLabel">
              <InputField
                type="number"
                value={formState.max_orders_per_route}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    max_orders_per_route: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Max vehicles:" gap={2} warningPlacement="besidesLabel">
              <InputField
                type="number"
                value={formState.max_vehicles}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    max_vehicles: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Window start:" gap={2} warningPlacement="besidesLabel">
              <InputField
                type="time"
                value={formState.operating_window_start}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    operating_window_start: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Window end:" gap={2} warningPlacement="besidesLabel">
              <InputField
                type="time"
                value={formState.operating_window_end}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    operating_window_end: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
        </SplitRow>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="ETA tolerance (seconds):" gap={2} warningPlacement="besidesLabel">
              <InputField
                type="number"
                value={formState.eta_tolerance_seconds}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    eta_tolerance_seconds: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Route end strategy:" gap={2} warningPlacement="besidesLabel">
              <OptionPopoverSelect
                options={routeEndStrategyOptions}
                value={formState.default_route_end_strategy || null}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    default_route_end_strategy: String(value ?? ''),
                  }))
                }
                placeholder="Select route end strategy"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>

      <section className="rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-none">
        <div className="border-b border-[var(--color-border-accent)] px-4 py-3">
          <SectionHeading
            title="Vehicle Preferences"
            description="Capability and vehicle preferences consumed by routing."
          />
        </div>

        <SplitRow splitRowClass="grid grid-cols-2 divide-x divide-[var(--color-border-accent)]">
          <Cell>
            <Field label="Required capability:" gap={2} warningPlacement="besidesLabel">
              <OptionPopoverSelect
                options={capabilityOptions}
                value={formState.vehicle_capabilities_required || null}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    vehicle_capabilities_required: String(value ?? ''),
                  }))
                }
                placeholder="Select capability"
                emptyLabel="None"
                inputFieldClassName={`${PLAIN_INPUT_CONTAINER_CLASS} flex w-full items-center justify-between gap-2`}
              />
            </Field>
          </Cell>

          <Cell>
            <Field label="Preferred vehicle IDs:" gap={2} warningPlacement="besidesLabel">
              <InputField
                value={formState.preferred_vehicle_ids}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    preferred_vehicle_ids: event.target.value,
                  }))
                }
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
                placeholder="10, 11"
              />
            </Field>
          </Cell>
        </SplitRow>
      </section>
    </div>
  )
}
