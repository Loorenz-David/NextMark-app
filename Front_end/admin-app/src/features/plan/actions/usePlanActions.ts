import {
  useBaseControlls,
  usePopupManager,
  useSectionManager,
} from "@/shared/resource-manager/useResourceManager";
import type { PayloadBase } from "@/features/home-route-operations/types/types";
import type { DeliveryPlan } from "../types/plan";
import { getLastOpenedRouteGroupIdByPlanId } from "../routeGroup/store/activeRouteGroup.store";

export const usePlanHeaderAction = () => {
  const popupManager = usePopupManager();
  const baseControlls = useBaseControlls<PayloadBase>();
  const sectionManager = useSectionManager();

  const onCreatePlan = () => {
    popupManager.open({
      // key:"PlanForm",
      key: "zone.form",
      payload: { mode: "create" },
    });
  };

  const openPlanSection = (plan: DeliveryPlan) => {
    if (!plan.id) return;
    const routeGroupId = getLastOpenedRouteGroupIdByPlanId(plan.id);

    if (sectionManager.getOpenCount() > 0) {
      sectionManager.closeAll();
    }
    baseControlls.openBase({
      payload: {
        planId: plan.id,
        routeGroupId,
      },
    });
  };

  return {
    onCreatePlan,
    openPlanSection,
  };
};
