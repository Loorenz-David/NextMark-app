import type { RouteGroup } from '@/features/plan/routeGroup/types/routeGroup'

const DEFAULT_ROUTE_GROUP: RouteGroup = {
  id: 8101,
  client_id: 'fixture_route_group_8101',
  state_id: 1,
  actual_start_time: '2026-03-26T08:20:00.000Z',
  actual_end_time: null,
  is_optimized: true,
  driver_id: 31,
  route_plan_id: 7101,
  updated_at: '2026-03-26T08:12:00.000Z',
  route_solutions_ids: [9101, 9102],
}

export const makeRouteGroup = (overrides: Partial<RouteGroup> = {}): RouteGroup => ({
  ...DEFAULT_ROUTE_GROUP,
  ...overrides,
})
