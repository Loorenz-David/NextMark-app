import type {
  RouteEndTimeExceededWarning,
  RouteSolutionWarning,
} from '@/features/plan/planTypes/localDelivery/types/routeSolution'
import { formatRouteTime } from '@/features/plan/planTypes/localDelivery/utils/formatRouteTime'

export const ROUTE_SOLUTION_WARNING_TYPES = {
  ROUTE_END_TIME_EXCEEDED: 'route_end_time_exceeded',
} as const

export type RouteSolutionWarningRegistry = ReturnType<
  typeof createRouteSolutionWarningRegistry
>

export const createRouteSolutionWarningRegistry = () => {
  const registeredTypes = new Set<string>(Object.values(ROUTE_SOLUTION_WARNING_TYPES))
  const resolvableTypes = new Set<string>([
    ROUTE_SOLUTION_WARNING_TYPES.ROUTE_END_TIME_EXCEEDED,
  ])

  const isRegistered = (type?: string) =>
    typeof type === 'string' && registeredTypes.has(type)
  const isResolvable = (type?: string) =>
    typeof type === 'string' && resolvableTypes.has(type)

  const isRouteEndTimeExceeded = (
    warning: RouteSolutionWarning,
  ): warning is RouteEndTimeExceededWarning =>
    warning?.type === ROUTE_SOLUTION_WARNING_TYPES.ROUTE_END_TIME_EXCEEDED

  const getMessage = (warning: RouteSolutionWarning) => {
    if (typeof warning?.message === 'string' && warning.message.trim().length > 0) {
      return warning.message
    }
    if (isRouteEndTimeExceeded(warning)) {
      return 'Route ends after allowed end time'
    }
    return 'Route warning'
  }

  const getDisplayMeta = (
    warning: RouteSolutionWarning,
    planStartDate?: string | 'today' |null,
  ): Array<{ label: string; value: string }> => {
    if (isRouteEndTimeExceeded(warning)) {
      return [
        {
          label: 'Route expected end',
          value: formatRouteTime(warning.route_expected_end ?? null, planStartDate),
        },
        {
          label: 'Route allowed end',
          value: formatRouteTime(warning.route_allowed_end ?? null, planStartDate),
        },
      ]
    }
    return []
  }

  const getResolvableWarnings = (warnings: RouteSolutionWarning[]) =>
    warnings.filter((warning) => isResolvable(warning?.type))

  return {
    isRegistered,
    isResolvable,
    isRouteEndTimeExceeded,
    getMessage,
    getDisplayMeta,
    getResolvableWarnings,
  }
}
