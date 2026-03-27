import type { Dispatch, SetStateAction } from "react";
import type { ChangeEvent } from "react";
import type { DeliveryPlan } from "../../types/plan";
import type { PlanTypeState } from "./PlanForm.types";
import type { PlanWarningsControllers } from "./PlanForm.types";
type SetDeliveryPlanState = Dispatch<SetStateAction<DeliveryPlan>>;
type SetPlanTypeState = Dispatch<SetStateAction<PlanTypeState | null>>;

type PropsUsePlanFormSetters = {
  setPlanForm: SetDeliveryPlanState;
  setSelectedZoneIds: Dispatch<SetStateAction<number[]>>;
  planFormWarnings: PlanWarningsControllers;
};

export const usePlanFormSetters = ({
  setPlanForm,
  setSelectedZoneIds,
  planFormWarnings,
}: PropsUsePlanFormSetters) => {
  const handlePlanType = () => undefined;
  const handlePlanName = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    planFormWarnings.planNameWarning.validate(value);
    setPlanForm((prev) => ({ ...prev, label: value }));
  };

  const handleStartDate = (value: string) => {
    setPlanForm((prev) => {
      const { end_date } = prev;
      planFormWarnings.planStartDateWarning.validate({
        start_date: value,
        end_date,
      });

      return { ...prev, start_date: value };
    });
  };
  const handleEndDate = (value: string) => {
    setPlanForm((prev) => {
      const { start_date } = prev;
      planFormWarnings.planStartDateWarning.validate({
        start_date,
        end_date: value,
      });

      return { ...prev, end_date: value };
    });
  };

  const handleZoneSelectionToggle = (zoneId: number, checked: boolean) => {
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      return;
    }

    setSelectedZoneIds((prev) => {
      if (checked) {
        return prev.includes(zoneId) ? prev : [...prev, zoneId];
      }
      return prev.filter((id) => id !== zoneId);
    });
  };

  return {
    handlePlanType,
    handlePlanName,
    handleStartDate,
    handleEndDate,
    handleZoneSelectionToggle,
  };
};
