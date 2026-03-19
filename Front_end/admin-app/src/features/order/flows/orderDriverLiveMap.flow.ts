import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  buildOrderDriverLocationMarkers,
  selectDriverLivePositions,
  selectDriverLiveVisibility,
  resolveActiveLocalDeliveryPlanIdByDriverId,
  useDriverLiveMarkerOverlayStore,
  useDriverLiveStore,
  useDriverLiveVisibilityStore,
} from '@/realtime/driverLive'
import { useLocalDeliveryPlans } from '@/features/plan/planTypes/localDelivery/store/useLocalDeliveryPlan.selector'
import { useRouteSolutions } from '@/features/plan/planTypes/localDelivery/store/useRouteSolution.selector'
import type { PayloadBase } from '@/features/home/types/types'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useBaseControlls, useMapManager } from '@/shared/resource-manager/useResourceManager'

export const useOrderDriverLiveMapFlow = () => {
  const mapManager = useMapManager()
  const baseControls = useBaseControlls<PayloadBase>()
  const isBaseOpen = baseControls.isBaseOpen
  const openBase = baseControls.openBase
  const liveDriverPositions = useDriverLiveStore(useShallow(selectDriverLivePositions))
  const routeSolutions = useRouteSolutions()
  const localDeliveryPlans = useLocalDeliveryPlans()
  const isDriverLiveVisible = useDriverLiveVisibilityStore(selectDriverLiveVisibility)

  useEffect(() => {
    const { openOverlay, closeOverlay } = useDriverLiveMarkerOverlayStore.getState()

    const markers = buildOrderDriverLocationMarkers({
      positions: liveDriverPositions,
      resolvePlanIdByDriverId: (driverId) =>
        resolveActiveLocalDeliveryPlanIdByDriverId({
          driverId,
          routeSolutions,
          localDeliveryPlans,
        }),
      onResolvedPlanClick: (planId) => {
        openBase({
          payload: {
            planId,
            ordersPlanType: 'local_delivery',
          },
        })
      },
      onMouseEnter: (event, position) => {
        const markerAnchorEl = event.currentTarget as HTMLElement | null
        if (!markerAnchorEl) return

        openOverlay({
          markerId: `driver-live:orders:${position.driver_id}`,
          markerAnchorEl,
          position,
        })
      },
      onMouseLeave: () => {
        closeOverlay()
      },
    })

    mapManager.setMarkerLayer(MAP_MARKER_LAYERS.driverLiveOrders, markers)
    mapManager.setMarkerLayerVisibility(
      MAP_MARKER_LAYERS.driverLiveOrders,
      !isBaseOpen && isDriverLiveVisible,
    )

    if (isBaseOpen || !isDriverLiveVisible) {
      closeOverlay()
    }
  }, [
    isDriverLiveVisible,
    isBaseOpen,
    liveDriverPositions,
    localDeliveryPlans,
    mapManager,
    openBase,
    routeSolutions,
  ])

  useEffect(() => {
    return () => {
      mapManager.clearMarkerLayer(MAP_MARKER_LAYERS.driverLiveOrders)
      useDriverLiveMarkerOverlayStore.getState().closeOverlay()
    }
  }, [mapManager])
}
