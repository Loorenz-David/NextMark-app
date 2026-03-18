import type { DriverLocationUpdatedPayload } from '@shared-realtime'

import {
  buildLocalDeliveryDriverLocationMarkers,
  buildOrderDriverLocationMarkers,
  DRIVER_LIVE_ACTIVE_MAX_AGE_MS,
  resolveActiveLocalDeliveryPlanIdByDriverId,
  resolveDriverLocationActivity,
} from '../driverLive.map'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const now = Date.UTC(2026, 2, 18, 12, 0, 0)

const buildPosition = (overrides?: Partial<DriverLocationUpdatedPayload>): DriverLocationUpdatedPayload => ({
  driver_id: 10,
  team_id: 2,
  coords: { lat: 59.3293, lng: 18.0686 },
  timestamp: new Date(now).toISOString(),
  ...overrides,
})

export const runDriverLiveMapTests = () => {
  {
    const activity = resolveDriverLocationActivity(
      buildPosition({
        timestamp: new Date(now - DRIVER_LIVE_ACTIVE_MAX_AGE_MS + 1_000).toISOString(),
      }),
      now,
    )
    assert(activity === 'active', 'recent driver update should resolve active state')
  }

  {
    const activity = resolveDriverLocationActivity(
      buildPosition({
        timestamp: new Date(now - DRIVER_LIVE_ACTIVE_MAX_AGE_MS - 1_000).toISOString(),
      }),
      now,
    )
    assert(activity === 'passive', 'stale driver update should resolve passive state')
  }

  {
    const markers = buildLocalDeliveryDriverLocationMarkers({
      positions: [
        buildPosition({ driver_id: 10 }),
        buildPosition({ driver_id: 11 }),
      ],
      selectedDriverId: 11,
      onClick: () => undefined,
      now,
    })

    assert(markers.length === 1, 'local delivery driver markers should only include the selected driver')
    assert(markers[0].id === 'driver-live:local-delivery:11', 'local delivery marker id should be scope aware')
  }

  {
    const markers = buildOrderDriverLocationMarkers({
      positions: [
        buildPosition({ driver_id: 10 }),
        buildPosition({ driver_id: 11 }),
      ],
      resolvePlanIdByDriverId: () => null,
      onResolvedPlanClick: () => undefined,
      now,
    })

    assert(markers.length === 2, 'orders driver markers should include all live driver positions')
    assert(markers[0].id === 'driver-live:orders:10', 'orders marker id should be scope aware')
    assert(markers[1].id === 'driver-live:orders:11', 'orders marker ids should remain unique by driver')
  }

  {
    const planId = resolveActiveLocalDeliveryPlanIdByDriverId({
      driverId: 7,
      routeSolutions: [
        {
          client_id: 'solution-old',
          driver_id: 7,
          local_delivery_plan_id: 21,
          actual_start_time: '2026-03-18T09:00:00Z',
          actual_end_time: null,
          route_end_strategy: 'round_trip',
        },
        {
          client_id: 'solution-new',
          driver_id: 7,
          local_delivery_plan_id: 22,
          actual_start_time: '2026-03-18T10:00:00Z',
          actual_end_time: null,
          route_end_strategy: 'round_trip',
        },
      ],
      localDeliveryPlans: [
        { client_id: 'plan-21', id: 21, delivery_plan_id: 101 },
        { client_id: 'plan-22', id: 22, delivery_plan_id: 202 },
      ],
    })

    assert(planId === 202, 'resolver should choose the newest started active route for a driver')
  }

  {
    const planId = resolveActiveLocalDeliveryPlanIdByDriverId({
      driverId: 8,
      routeSolutions: [
        {
          client_id: 'solution-ended',
          driver_id: 8,
          local_delivery_plan_id: 30,
          actual_start_time: '2026-03-18T08:00:00Z',
          actual_end_time: '2026-03-18T11:00:00Z',
          route_end_strategy: 'round_trip',
        },
      ],
      localDeliveryPlans: [
        { client_id: 'plan-30', id: 30, delivery_plan_id: 300 },
      ],
    })

    assert(planId === null, 'resolver should ignore ended routes when choosing an active plan')
  }
}
