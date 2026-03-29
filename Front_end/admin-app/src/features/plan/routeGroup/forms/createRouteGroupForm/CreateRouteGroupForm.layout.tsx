import { ZoneSelector, type ZoneDefinition } from "@/features/zone";

import { CreateRouteGroupFormFooter } from "./components/CreateRouteGroupFormFooter";
import { useCreateRouteGroupForm } from "./CreateRouteGroupForm.context";
import { Field } from "@/shared/inputs/FieldContainer";
import { InputField } from "@/shared/inputs/InputField";
import { fieldContainer, fieldInput } from "@/constants/classes";

const PREVIEW_ZONES: ZoneDefinition[] = [
  {
    id: 101,
    version_id: 1,
    name: "Central North",
    zone_type: "system",
    is_active: true,
  },
  {
    id: 102,
    version_id: 1,
    name: "Central South",
    zone_type: "user",
    is_active: true,
  },
  {
    id: 103,
    version_id: 1,
    name: "Industrial West",
    zone_type: "bootstrap",
    is_active: false,
  },
  {
    id: 104,
    version_id: 1,
    name: "Harbor East",
    zone_type: "system",
    is_active: true,
  },
];

const PREVIEW_SELECTED_ZONES: ZoneDefinition[] = [PREVIEW_ZONES[1]];

export const CreateRouteGroupFormLayout = () => {
  const { formErrors, formSetters, formState } = useCreateRouteGroupForm();
  return (
    <>
      <form className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-ligth-bg)] px-4 pb-[88px] pt-4">
        <div className=" flex flex-col gap-4 mt-4 space-y-3 rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] p-4 shadow-sm">
          <Field
            label="Route group name:"
            required={true}
            warning={
              formErrors.name
                ? { isVisible: true, message: formErrors.name }
                : undefined
            }
            warningPlacement="besidesLabel"
          >
            <InputField
              value={formState.name}
              onChange={(event) => formSetters.setName(event.target.value)}
              fieldClassName={fieldContainer}
              inputClassName={fieldInput}
              placeholder="No-zone route group name"
            />
          </Field>
        </div>
        <div className=" flex flex-col gap-4 mt-4 space-y-3 rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] p-4 shadow-sm">
          <div className=" mt-4 mb-4 flex flex-col gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Zone selector preview{" "}
                <span className="text-xs text-[var(--color-muted)] pl-2">
                  ( optional )
                </span>
              </h3>
              <p className="text-xs text-[var(--color-muted)]">
                Temporary layout preview using decoy zones and no-op handlers.
              </p>
            </div>

        <ZoneSelector
          versionId={1}
          zones={PREVIEW_ZONES}
          selectedZones={PREVIEW_SELECTED_ZONES}
          mode="multi"
              onSelectZone={() => {}}
              onDeselectZone={() => {}}
              visibleLimit={4}
              listClassName="max-h-[280px]"
            />
          </div>
        </div>
      </form>
      <CreateRouteGroupFormFooter />
    </>
  );
};
