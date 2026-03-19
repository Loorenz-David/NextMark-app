import type { AssignedRouteViewModel, AssignedStopViewModel } from '@/app/contracts/routeExecution.types'
import { formatIsoToTeamTime } from '@/app/utils/teamTimeZone'
import type { DriverOrderStateIds } from '@/features/order-states'
import type { StopDetailPageDisplay } from './stopDetailDisplay.types'
import { buildStopPhoneCallOptions } from './buildStopPhoneCallOptions'



type StopDetailPageDisplayDependencies = {
  openTestSlidingPage: (title: string) => void
  openStopOrderItems: () => void
  openStopCustomer: () => void
  openOrderCases: () => void
  openFailureForm: () => void
  navigateToStop: () => void
  callOrderPhone: () => void
  completeStop: () => void
  undoTerminal: () => void
  openOrderNotes: (() => void) | null
  activeCasesCount: number
  orderStateIds: DriverOrderStateIds
}

function getStreetAddress(stop: AssignedStopViewModel) {
  return stop.address?.street_address?.split(',')[0]?.trim() || stop.title || 'Unknown stop'
}

function formatExpectedArrivalTime(value: string | null) {
  if (!value) {
    return 'Unknown time'
  }
  return formatIsoToTeamTime(value, { locale: 'sv-SE' }) ?? 'Unknown time'
}

function formatItemCountLabel(itemCount: number) {
  return `${itemCount} item${itemCount === 1 ? '' : 's'}`
}

function formatCustomerName(stop: AssignedStopViewModel) {
  const parts = [
    stop.order?.client_first_name?.trim(),
    stop.order?.client_last_name?.trim(),
  ].filter((value): value is string => Boolean(value))

  if (parts.length === 0) {
    return 'Customer details not set'
  }

  return parts.join(' ')
}

export function mapStopDetailToPageDisplay(
  route: AssignedRouteViewModel,
  stop: AssignedStopViewModel,
  deps: StopDetailPageDisplayDependencies,
): StopDetailPageDisplay {
  const stopOrderLabel = stop.stopOrder != null ? String(stop.stopOrder) : '—'
  const totalStopsLabel = route.totalStops > 0 ? String(route.totalStops) : '—'
  const orderStateId = stop.order?.order_state_id ?? null
  const isCompleted = orderStateId != null && orderStateId === deps.orderStateIds.completedId
  const isFailed = orderStateId != null && orderStateId === deps.orderStateIds.failId
  const isTerminal = isCompleted || isFailed
  const phoneCallOptions = buildStopPhoneCallOptions(stop)
  const phoneDisplayValue = phoneCallOptions.length === 0
    ? 'Not set'
    : phoneCallOptions.length === 1
      ? phoneCallOptions[0].displayValue
      : `${phoneCallOptions.length} numbers`

  return {
    header: {
      streetAddress: getStreetAddress(stop),
      stopMeta: `${stopOrderLabel} / ${totalStopsLabel} • ${formatExpectedArrivalTime(stop.expectedArrivalTime)}`,
    },
    headerMode: isTerminal ? 'terminal-status' : 'primary-actions',
    primaryActions: [
      { id: 'navigate', label: 'Navigate', tone: 'navigate', onPress: deps.navigateToStop },
      { id: 'failed', label: 'Failed', tone: 'failed', onPress: deps.openFailureForm },
      { id: 'completed', label: 'Completed', tone: 'completed', onPress: deps.completeStop },
    ],
    terminalStatus: isTerminal
      ? {
          label: isCompleted ? 'Marked as completed' : 'Marked as failed',
          onUndo: deps.undoTerminal,
        }
      : null,
    infoRows: [
      {
        id: 'order-phone',
        label: 'Order phone',
        value: phoneDisplayValue,
        onPress: deps.callOrderPhone,
      },
      {
        id: 'items',
        label: 'Items',
        value: stop.orderItems.length > 0 ? formatItemCountLabel(stop.orderItems.length) : 'No items',
        onPress: deps.openStopOrderItems,
      },
      {
        id: 'customer',
        label: 'Customer',
        value: formatCustomerName(stop),
        onPress: deps.openStopCustomer,
      },
      {
        id: 'service-time',
        label: 'Service time',
        value: stop.serviceDurationLabel ?? stop.serviceLabel ?? 'Not set',
        onPress: () => deps.openTestSlidingPage('Service time'),
      },
      {
        id: 'cases',
        label: 'Cases',
        value: String(deps.activeCasesCount),
        onPress: deps.openOrderCases,
      },
    ],
    orderNoteCard: (() => {
      const notes = stop.order?.order_notes
      if (!notes || notes.length === 0) return null
      return {
        firstNote: notes[0],
        allNotes: notes,
        onPress: notes.length > 1 ? deps.openOrderNotes : null,
      }
    })(),
  }
}
