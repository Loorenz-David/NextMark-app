import {
  RouteGroupRail,
  RouteGroupsPageHeader,
  type RouteGroupRailItem,
} from "../components";
import type { RouteGroupHeaderSummary } from "../domain/buildRouteGroupHeaderSummary";
import { useRouteGroupsPageShellController } from "../controllers/useRouteGroupsPageShell.controller";
import { RouteGroupPageProvider } from "../providers/RouteGroupPageProvider";
import { RouteGroupsPageContent } from "./RouteGroupsPageContent.page";

type PlanOrdersPagePayload = {
  planId?: number;
  routeGroupId?: number | null;
  freshAfter?: string | null;
};

type RouteGroupsPageProps = {
  payload: PlanOrdersPagePayload;
  onRequestClose?: () => void;
};

type RouteGroupsPageLayoutProps = {
  headerSummary: RouteGroupHeaderSummary;
  onRequestClose?: () => void;
  routeGroups: RouteGroupRailItem[];
  onRouteGroupClick: (item: RouteGroupRailItem) => void;
  showOptimizeRow: boolean;
  hasActiveRouteGroup: boolean;
};

export const RouteGroupsPageLayout = ({
  headerSummary,
  onRequestClose,
  routeGroups,
  onRouteGroupClick,
  showOptimizeRow,
  hasActiveRouteGroup,
}: RouteGroupsPageLayoutProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-primary)]/5 md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        <RouteGroupsPageHeader
          summary={headerSummary}
          onRequestClose={onRequestClose}
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="min-h-0 border-b border-white/8 md:h-full md:border-b-0 md:border-r md:border-white/8">
            <RouteGroupRail items={routeGroups} onClick={onRouteGroupClick} />
          </div>
          <div className="min-h-0 flex-1">
            <RouteGroupsPageContent
              showOptimizeRow={showOptimizeRow}
              hasActiveRouteGroup={hasActiveRouteGroup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RouteGroupsPage = ({
  payload,
  onRequestClose,
}: RouteGroupsPageProps) => {
  const planId = payload?.planId ?? null;

  if (planId == null) return null;

  return (
    <RouteGroupPageProvider
      planId={planId}
      preferredRouteGroupId={payload?.routeGroupId ?? null}
      freshAfter={payload?.freshAfter ?? null}
    >
      <RouteGroupsPageScreen planId={planId} onRequestClose={onRequestClose} />
    </RouteGroupPageProvider>
  );
};

type RouteGroupsPageScreenProps = {
  planId: number;
  onRequestClose?: () => void;
};

const RouteGroupsPageScreen = ({
  planId,
  onRequestClose,
}: RouteGroupsPageScreenProps) => {
  const {
    railItems,
    handleRouteGroupClick,
    headerSummary,
    hasRouteGroups,
    hasActiveRouteGroup,
    showOptimizeRow,
  } = useRouteGroupsPageShellController(planId);

  if (!hasRouteGroups) {
    return (
      <div className="flex h-full w-full flex-col bg-[var(--color-primary)]/5">
        <RouteGroupsPageHeader
          summary={headerSummary}
          onRequestClose={onRequestClose}
        />
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="max-w-lg rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <h3 className="text-lg font-semibold text-white">
              No Route Groups Yet
            </h3>
            <p className="mt-2 text-sm text-white/70">
              This plan has no materialized route groups yet. Select zones to
              materialize route groups for this plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RouteGroupsPageLayout
      headerSummary={headerSummary}
      onRequestClose={onRequestClose}
      routeGroups={railItems}
      onRouteGroupClick={handleRouteGroupClick}
      showOptimizeRow={showOptimizeRow}
      hasActiveRouteGroup={hasActiveRouteGroup}
    />
  );
};
