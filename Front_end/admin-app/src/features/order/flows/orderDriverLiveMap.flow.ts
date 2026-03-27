import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  buildOrderDriverLocationMarkers,
  selectDriverLivePositions,
  selectDriverLiveVisibility,
  resolveActiveRoutePlanIdByDriverId,
  useDriverLiveMarkerOverlayStore,
  useDriverLiveStore,
  useDriverLiveVisibilityStore,
} from '@/realtime/driverLive'
import { useRouteGroups } from '@/features/plan/routeGroup/store/useRouteGroup.selector'
import { useRouteSolutions } from '@/features/plan/routeGroup/store/useRouteSolution.selector'
import type { PayloadBase } from '@/features/home-route-operations/types/types'
import { MAP_MARKER_LAYERS } from '@/shared/map'
import { useBaseControlls, useMapManager } from '@/shared/resource-manager/useResourceManager'

export const useOrderDriverLiveMapFlow = () => {
  const mapManager = useMapManager()
  const baseControls = useBaseControlls<PayloadBase>()
  const isBaseOpen = baseControls.isBaseOpen
  const openBase = baseControls.openBase
  const liveDriverPositions = useDriverLiveStore(useShallow(selectDriverLivePositions))
  const routeSolutions = useRouteSolutions()
  const routeGroups = useRouteGroups()
  const isDriverLiveVisible = useDriverLiveVisibilityStore(selectDriverLiveVisibility)

  useEffect(() => {
    const { openOverlay, closeOverlay } = useDriverLiveMarkerOverlayStore.getState()

    const markers = buildOrderDriverLocationMarkers({
      positions: liveDriverPositions,
      resolvePlanIdByDriverId: (driverId) =>
        resolveActiveRoutePlanIdByDriverId({
          driverId,
          routeSolutions,
          routeGroups,
        }),
      onResolvedPlanClick: (planId) => {
        openBase({
          payload: {
            planId,
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
    routeGroups,
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
