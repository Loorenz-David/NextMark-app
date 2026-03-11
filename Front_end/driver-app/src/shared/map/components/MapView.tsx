import { useEffect, useRef } from 'react'
import type { MapMarker } from '../domain/entities/MapMarker'
import type { MapRoute } from '../domain/entities/MapRoute'
import type { Coordinates, MapConfig } from '../domain/types'
import { useMap } from '../hooks/useMap'

type MapMarkerLayer = {
  layerId: string
  markers: MapMarker[]
}

type MapViewProps = {
  markers: MapMarker[]
  route: MapRoute | null
  markerLayers?: MapMarkerLayer[]
  selectedMarkerId?: string | null
  hoveredMarkerId?: string | null
  focusCoordinates?: Coordinates | null
  focusRequestKey?: number
  options?: MapConfig
  className?: string
}

export function MapView({
  markers,
  route,
  markerLayers = [],
  selectedMarkerId,
  hoveredMarkerId,
  focusCoordinates,
  focusRequestKey,
  options,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const {
    initialize,
    showMarkers,
    setMarkerLayer,
    showRoute,
    setSelectedMarker,
    setHoveredMarker,
    focusCoordinates: focusMapCoordinates,
  } = useMap(options)

  useEffect(() => {
    void initialize(containerRef.current, options)
  }, [initialize, options])

  useEffect(() => {
    showMarkers(markers)
  }, [markers, showMarkers])

  useEffect(() => {
    showRoute(route)
  }, [route, showRoute])

  useEffect(() => {
    markerLayers.forEach((layer) => {
      setMarkerLayer(layer.layerId, layer.markers)
    })
  }, [markerLayers, setMarkerLayer])

  useEffect(() => {
    setSelectedMarker(selectedMarkerId ?? null)
  }, [selectedMarkerId, setSelectedMarker])

  useEffect(() => {
    setHoveredMarker(hoveredMarkerId ?? null)
  }, [hoveredMarkerId, setHoveredMarker])

  useEffect(() => {
    if (!focusCoordinates || focusRequestKey === undefined) {
      return
    }

    focusMapCoordinates(focusCoordinates)
  }, [focusCoordinates, focusMapCoordinates, focusRequestKey])

  return <div ref={containerRef} className={className} />
}
