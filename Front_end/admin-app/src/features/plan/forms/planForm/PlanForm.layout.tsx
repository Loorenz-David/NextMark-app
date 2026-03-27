import { Field } from "@/shared/inputs/FieldContainer";
import {
  InputField,
  PLAIN_INPUT_CLASS,
  PLAIN_INPUT_CONTAINER_CLASS,
} from "@/shared/inputs/InputField";
import { CustomDatePicker } from "@/shared/inputs/CustomDatePicker";
import { InputWarning } from "@/shared/inputs/InputWarning";
import { BasicButton } from "@/shared/buttons/BasicButton";
import { ConfirmActionButton } from "@/shared/buttons/DeleteButton";
import { FeaturePopupFooter } from "@/shared/popups/featurePopup";
import { ZoneSelectionStep } from "./components/ZoneSelectionStep";

import { usePlanForm } from "./PlanForm.context";
import { Cell, SplitRow } from "@/shared/layout/cells";

export const PlanFormLayout = ({}) => {
  const {
    mode,
    planForm,
    availableZones,
    isZonesLoading,
    selectedZoneIds,
    planSetters,
    planActions,
    planFormWarnings,
  } = usePlanForm();

  return (
    <>
      <form
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 pt-4 scroll-thin bg-[var(--color-ligth-bg)] h-full pb-[100px]`}
        action=""
      >
        <div className=" rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-page)] shadow-sm mb-4">
          <Cell>
            <Field
              warningPlacement="besidesLabel"
              label="Plan name:"
              required={true}
              warning={planFormWarnings.planNameWarning.warning}
              warningController={planFormWarnings.planNameWarning}
            >
              <InputField
                value={planForm.label}
                onChange={planSetters.handlePlanName}
                fieldClassName={PLAIN_INPUT_CONTAINER_CLASS}
                inputClassName={PLAIN_INPUT_CLASS}
              />
            </Field>
          </Cell>
          <SplitRow
            splitRowClass={
              "grid grid-cols-2 divide-x divide-[var(--color-border-accent)]"
            }
          >
            <Cell cellClass="py-2 px-3">
              <Field label="From:" required={true}>
                <CustomDatePicker
                  date={
                    planForm.start_date
                      ? new Date(planForm.start_date)
                      : new Date()
                  }
                  onChange={(value) => planSetters.handleStartDate(value ?? "")}
                  disablePast
                  className="pl-3 py-2"
                  renderPopoverInPortal
                />
              </Field>
            </Cell>
            <Cell cellClass="py-2 px-3">
              <Field label="To:" required={true}>
                <CustomDatePicker
                  date={
                    planForm.end_date ? new Date(planForm.end_date) : new Date()
                  }
                  onChange={(value) => planSetters.handleEndDate(value ?? "")}
                  disablePast
                  className="pl-3 py-2"
                  renderPopoverInPortal
                />
              </Field>
            </Cell>
          </SplitRow>
          <ZoneSelectionStep
            availableZones={availableZones}
            isZonesLoading={isZonesLoading}
            selectedZoneIds={selectedZoneIds}
            onZoneSelectionToggle={planSetters.handleZoneSelectionToggle}
          />
        </div>
        {planFormWarnings.planStartDateWarning?.warning && (
          <InputWarning {...planFormWarnings.planStartDateWarning.warning} />
        )}
      </form>
      <FeaturePopupFooter>
        {mode === "edit" ? (
          <ConfirmActionButton
            onConfirm={planActions.handleDeletePlan}
            deleteContent={"Delete"}
            confirmContent={"Confirm Deletion"}
            deleteClassName={
              "text-sm rounded-md bg-[var(--color-page)] text-red-500 border-[text-red-500] px-2 py-2"
            }
            confirmClassName={
              "text-sm rounded-md bg-red-500 py-2 px-2 text-white"
            }
          />
        ) : (
          <span />
        )}
        {mode === "create" ? (
          <div className="flex flex-1 justify-end">
            <BasicButton
              params={{
                variant: "primary",
                className: "py-2 px-5",
                onClick: planActions.handleCreatePlan,
              }}
            >
              Create Plan
            </BasicButton>
          </div>
        ) : null}
      </FeaturePopupFooter>
    </>
  );
};
