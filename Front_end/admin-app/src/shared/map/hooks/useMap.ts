import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { MapBounds, MapBridge, MapConfig, MapViewportInsets, SetMarkerLayerOptions } from '../domain/types'
import type { MapOrder } from '../domain/entities/MapOrder'
import type { Route } from '../domain/entities/Route'
import { MapController } from '../domain/services/MapController'
import { GoogleMapAdapter } from '../infrastructure/GoogleMapAdapter'

export const useMap = (options?: MapConfig): MapBridge => {
  const controllerRef = useRef<MapController | null>(null)

  const controller = useMemo(() => {
    if (!controllerRef.current) {
      controllerRef.current = new MapController(new GoogleMapAdapter())
    }
    return controllerRef.current
  }, [])

  const initialize = useCallback(
    async (container: HTMLElement | null, overrideOptions?: MapConfig) => {
      if (!container) return

      const baseOptions = overrideOptions ?? options 

      const userCoords = await getUserCoordinates()
      const finalOptions: MapConfig = {
        ...baseOptions,
        mapId: baseOptions?.mapId ?? import.meta.env.VITE_GOOGLE_MAPS_MAP_ID_LIGHT,
        zoom: baseOptions?.zoom ?? 11,
        center:
          baseOptions?.center ??
          userCoords ?? 
          baseOptions?.center,
      }

      await controller.initialize(container, finalOptions)
    },
    [controller, options],
  )

  const selectOrder = useCallback(
    (id: string | number)=>{
      controller.selectMarker(id)
    },
    [controller]
  )

  const setSelectedMarker = useCallback(
    (id: string | null) => {
      controller.setSelectedMarker(id)
    },
    [controller],
  )

  const setHoveredMarker = useCallback(
    (id: string | null) => {
      controller.setHoveredMarker(id)
    },
    [controller],
  )

  const showOrders = useCallback(
    (orders: MapOrder[]) => {
      controller.showOrders(orders)
    },
    [controller],
  )

  const setMarkerLayer = useCallback(
    (layerId: string, orders: MapOrder[], options?: SetMarkerLayerOptions) => {
      controller.setMarkerLayer(layerId, orders, options)
    },
    [controller],
  )

  const setMarkerLayerVisibility = useCallback(
    (layerId: string, visible: boolean) => {
      controller.setMarkerLayerVisibility(layerId, visible)
    },
    [controller],
  )

  const clearMarkerLayer = useCallback(
    (layerId: string) => {
      controller.clearMarkerLayer(layerId)
    },
    [controller],
  )

  const enableCircleSelection = useCallback(
    (params: { layerId: string; callback: (ids: string[]) => void }) => {
      controller.enableCircleSelection(params)
    },
    [controller],
  )

  const disableCircleSelection = useCallback(() => {
    controller.disableCircleSelection()
  }, [controller])

  const showRoute = useCallback(
    (route: Route | null) => {
      controller.showRoute(route)
    },
    [controller],
  )

  const setViewportInsets = useCallback(
    (insets: MapViewportInsets) => {
      controller.setViewportInsets(insets)
    },
    [controller],
  )

  const reframeToVisibleArea = useCallback(() => {
    controller.reframeToVisibleArea()
  }, [controller])

  const subscribeBoundsChanged = useCallback(
    (callback: (bounds: MapBounds | null) => void) => controller.subscribeBoundsChanged(callback),
    [controller],
  )

  const getUserCoordinates = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 5000,
        },
      )
    })
  }

  useEffect(() => {
    return () => {
      controller.destroy()
    }
  }, [controller])

  const resize = useCallback(() => {
    controller.resize()
  }, [controller])

  return useMemo(
    () => ({
      initialize,
      showOrders,
      setMarkerLayer,
      setMarkerLayerVisibility,
      clearMarkerLayer,
      enableCircleSelection,
      disableCircleSelection,
      showRoute,
      selectOrder,
      setSelectedMarker,
      setHoveredMarker,
      setViewportInsets,
      reframeToVisibleArea,
      subscribeBoundsChanged,
      resize
    }),
    [clearMarkerLayer, disableCircleSelection, enableCircleSelection, initialize, reframeToVisibleArea, resize, selectOrder, setHoveredMarker, setMarkerLayer, setMarkerLayerVisibility, setSelectedMarker, setViewportInsets, showOrders, showRoute, subscribeBoundsChanged],
  )
}
