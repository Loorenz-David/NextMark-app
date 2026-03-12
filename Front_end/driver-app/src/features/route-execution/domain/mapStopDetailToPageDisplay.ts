import type { AssignedRouteViewModel, AssignedStopViewModel } from '@/app/contracts/routeExecution.types'
import type { StopDetailPageDisplay } from './stopDetailDisplay.types'



type StopDetailPageDisplayDependencies = {
  openTestSlidingPage: (title: string) => void
}

function getStreetAddress(stop: AssignedStopViewModel) {
  return stop.address?.street_address?.split(',')[0]?.trim() || stop.title || 'Unknown stop'
}

function formatExpectedArrivalTime(value: string | null) {
  if (!value) {
    return 'Unknown time'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown time'
  }

  return new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

export function mapStopDetailToPageDisplay(
  route: AssignedRouteViewModel,
  stop: AssignedStopViewModel,
  deps: StopDetailPageDisplayDependencies,
): StopDetailPageDisplay {
  const stopOrderLabel = stop.stopOrder != null ? String(stop.stopOrder) : '—'
  const totalStopsLabel = route.totalStops > 0 ? String(route.totalStops) : '—'

  return {
    header: {
      streetAddress: getStreetAddress(stop),
      stopMeta: `${stopOrderLabel} / ${totalStopsLabel} ◦ ${formatExpectedArrivalTime(stop.expectedArrivalTime)}`,
    },
    primaryActions: [
      { id: 'navigate', label: 'Navigate', tone: 'navigate'},
      { id: 'failed', label: 'Failed', tone: 'failed' },
      { id: 'completed', label: 'Completed', tone: 'completed' },
    ],
    infoRows: [
      {
        id: 'service-time',
        label: 'Service time',
        value: stop.serviceDurationLabel ?? stop.serviceLabel ?? 'Not set',
        onPress: () => deps.openTestSlidingPage('Service time'),
      },
      {
        id: 'order-phone',
        label: 'Order phone',
        value: stop.phoneLine ?? 'Not set',
        onPress: () => deps.openTestSlidingPage('Order phone'),
      },
      {
        id: 'items',
        label: 'Items',
        value: stop.itemSummary ?? 'No items',
        onPress: () => deps.openTestSlidingPage('Items'),
      },
    ],
  }
}
