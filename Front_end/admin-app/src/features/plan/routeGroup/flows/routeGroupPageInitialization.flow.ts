import { useEffect, useRef } from "react";
import { shouldRefreshForFreshness } from "@shared-utils";

import { useRouteGroupOverviewFlow } from "@/features/plan/routeGroup/flows/routeGroupOverview.flow";
import { useRouteGroupsByPlanId } from "@/features/plan/routeGroup/store/useRouteGroup.selector";
import {
  useRouteSolutionsByRouteGroupId,
  useSelectedRouteSolutionByRouteGroupId,
} from "@/features/plan/routeGroup/store/useRouteSolution.selector";
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
  preferredRouteGroupId?: number | null,
  options?: { disabled?: boolean },
) => {
  const { fetchRouteGroupOverview } = useRouteGroupOverviewFlow();
  const isFixtureMode = isRouteOperationsFixtureModeEnabled();
  const plan = useRoutePlanByServerId(planId);
  const routeGroups = useRouteGroupsByPlanId(planId);
  const activeRouteGroupId = useActiveRouteGroupId();
  const routeGroup =
    routeGroups.find((candidateRouteGroup) => candidateRouteGroup.id === activeRouteGroupId) ??
    null;
  const routeGroupId = routeGroup?.id ?? null;
  const routeSolutions = useRouteSolutionsByRouteGroupId(routeGroupId);
  const selectedRouteSolution =
    useSelectedRouteSolutionByRouteGroupId(routeGroupId) ??
    routeSolutions[0] ??
    null;
  const lastRefreshAttemptRef = useRef<string | null>(null);
  const initialSelectionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (planId == null || options?.disabled || isFixtureMode) {
      initialSelectionKeyRef.current = null;
      return;
    }

    const selectionKey = `${planId}:${preferredRouteGroupId ?? "default"}`;
    if (initialSelectionKeyRef.current === selectionKey) {
      return;
    }

    if (activeRouteGroupId != null) {
      initialSelectionKeyRef.current = selectionKey;
      return;
    }

    const preferredRouteGroupExists =
      typeof preferredRouteGroupId === "number" &&
      routeGroups.some((candidateRouteGroup) => candidateRouteGroup.id === preferredRouteGroupId);

    if (preferredRouteGroupExists) {
      setActiveRouteGroupId(preferredRouteGroupId);
      rememberRouteGroupForPlan(planId, preferredRouteGroupId);
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
    preferredRouteGroupId,
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

    const requestedRouteGroupId =
      activeRouteGroupId ?? preferredRouteGroupId ?? null;

    const hasRouteGroups = routeGroups.length > 0;
    const hasActiveRouteGroup = routeGroup != null;
    const isWorkspaceHydrated = Boolean(
      !hasRouteGroups ||
      !hasActiveRouteGroup ||
      (routeSolutions.length > 0 && selectedRouteSolution),
    );
    const needsRefresh =
      plan == null ||
      !isWorkspaceHydrated ||
      shouldRefreshForFreshness(plan.updated_at ?? null, freshAfter ?? null);
    if (!needsRefresh) {
      lastRefreshAttemptRef.current = null;
      return;
    }

    const refreshKey = `${planId}:${freshAfter ?? ""}:${requestedRouteGroupId ?? ""}`;
    if (lastRefreshAttemptRef.current === refreshKey) {
      return;
    }
    lastRefreshAttemptRef.current = refreshKey;

    fetchRouteGroupOverview(planId, requestedRouteGroupId);
  }, [
    activeRouteGroupId,
    fetchRouteGroupOverview,
    freshAfter,
    preferredRouteGroupId,
    routeGroup,
    plan,
    planId,
    routeGroups,
    routeSolutions.length,
    selectedRouteSolution,
    options?.disabled,
    isFixtureMode,
  ]);
};
