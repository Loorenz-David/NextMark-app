export type RouteGroupRailItem = {
  route_group_id: number;
  label: string;
  completionRatio: number;
  orderCount: number;
  stateLabel: string | null;
  stateColor: string | null;
  routeSolutionCount: number;
  zoneLabel: string | null;
  isActive?: boolean;
};
