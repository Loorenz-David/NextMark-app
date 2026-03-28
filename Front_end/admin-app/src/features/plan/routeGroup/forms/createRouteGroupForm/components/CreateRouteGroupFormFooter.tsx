import { BasicButton } from "@/shared/buttons/BasicButton";
import { FeaturePopupFooter } from "@/shared/popups/featurePopup";

import { useCreateRouteGroupForm } from "../CreateRouteGroupForm.context";

export const CreateRouteGroupFormFooter = () => {
  const { actions, isSubmitting } = useCreateRouteGroupForm();

  return (
    <FeaturePopupFooter>
      <span className="text-xs text-[var(--color-muted)]">
        Route groups are created optimistically and rolled back if the request fails.
      </span>
      <BasicButton
        params={{
          variant: "primary",
          className: "px-5 py-2",
          onClick: () => {
            void actions.handleSubmit();
          },
          disabled: isSubmitting,
        }}
      >
        {isSubmitting ? "Creating..." : "Create Route Group"}
      </BasicButton>
    </FeaturePopupFooter>
  );
};
