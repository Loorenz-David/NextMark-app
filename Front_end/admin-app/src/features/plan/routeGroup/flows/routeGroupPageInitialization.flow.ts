import { useEffect, useRef } from "react";
import { shouldRefreshForFreshness } from "@shared-utils";

import { useRouteGroupOverviewFlow } from "@/features/plan/routeGroup/flows/routeGroupOverview.flow";
import { useRouteGroupsByPlanId } from "@/features/plan/routeGroup/store/useRouteGroup.selector";
import { useRoutePlanByServerId } from "@/features/plan/store/useRoutePlan.selector";
import { isRouteOperationsFixtureModeEnabled } from "@/features/home-route-operations/dev/routeOperationsFixtureMode";
import { useActiveRouteGroupId } from "../store/useActiveRouteGroup.selector";
import {
  rememberRouteGroupForPlan,
  setActiveRouteGroupId,
} from "../store/activeRouteGroup.store";

export const useRouteGroupPageInitializationFlow = (
  planId: number | null,
  freshAfter?: string | null,
  options?: { disabled?: boolean },
) => {
  const { fetchRouteGroupOverview } = useRouteGroupOverviewFlow();
  const isFixtureMode = isRouteOperationsFixtureModeEnabled();
  const plan = useRoutePlanByServerId(planId);
  const routeGroups = useRouteGroupsByPlanId(planId);
  const activeRouteGroupId = useActiveRouteGroupId();
  const lastRefreshAttemptRef = useRef<string | null>(null);
  const initialSelectionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (planId == null || options?.disabled || isFixtureMode) {
      initialSelectionKeyRef.current = null;
      return;
    }

    const selectionKey = `${planId}:default`;
    if (initialSelectionKeyRef.current === selectionKey) {
      return;
    }

    if (activeRouteGroupId != null) {
      initialSelectionKeyRef.current = selectionKey;
      return;
    }

    const firstRouteGroupId = routeGroups[0]?.id ?? null;
    if (typeof firstRouteGroupId === "number") {
      setActiveRouteGroupId(firstRouteGroupId);
      rememberRouteGroupForPlan(planId, firstRouteGroupId);
      initialSelectionKeyRef.current = selectionKey;
    }
  }, [
    activeRouteGroupId,
    isFixtureMode,
    options?.disabled,
    planId,
    routeGroups,
  ]);

  useEffect(() => {
    if (options?.disabled || isFixtureMode) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    if (planId == null) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const hasRouteGroups = routeGroups.length > 0;
    const isWorkspaceHydrated = plan != null && hasRouteGroups;
    const needsRefresh =
      plan == null ||
      !isWorkspaceHydrated ||
      shouldRefreshForFreshness(plan.updated_at ?? null, freshAfter ?? null);
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const refreshKey = `${planId}:${freshAfter ?? ""}`;
    if (lastRefreshAttemptRef.current === refreshKey) {
      return;
    }
    lastRefreshAttemptRef.current = refreshKey;

    fetchRouteGroupOverview(planId);
  }, [
    fetchRouteGroupOverview,
    freshAfter,
    plan,
    planId,
    routeGroups,
    options?.disabled,
    isFixtureMode,
  ]);
};
