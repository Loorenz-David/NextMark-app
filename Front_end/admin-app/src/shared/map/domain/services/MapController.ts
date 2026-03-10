import type { MapAdapter, MapBounds, MapConfig, MapViewportInsets, SetMarkerLayerOptions } from '../types'
import type { MapOrder } from '../entities/MapOrder'
import type { Route } from '../entities/Route'
import { MAP_MARKER_LAYERS } from '../constants/markerLayers'

export class MapController {
  private adapter: MapAdapter

  constructor(adapter: MapAdapter) {
    this.adapter = adapter
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.adapter.initialize(container, options)
  }

  selectMarker(id: string | number  ){

    this.adapter.selectMarker(String(id))
  }

  setSelectedMarker(id: string | null) {
    this.adapter.setSelectedMarker(id)
  }

  setHoveredMarker(id: string | null) {
    this.adapter.setHoveredMarker(id)
  }
  showOrders(orders: MapOrder[]) {
    this.adapter.setLayerMarkers(MAP_MARKER_LAYERS.default, orders, { fitBounds: true })
  }

  setMarkerLayer(layerId: string, orders: MapOrder[], options?: SetMarkerLayerOptions) {
    this.adapter.setLayerMarkers(layerId, orders, options)
  }

  setMarkerLayerVisibility(layerId: string, visible: boolean) {
    this.adapter.setLayerVisibility(layerId, visible)
  }

  clearMarkerLayer(layerId: string) {
    this.adapter.clearLayer(layerId)
  }

  enableCircleSelection(params: { layerId: string; callback: (ids: string[]) => void }) {
    this.adapter.enableCircleSelection(params)
  }

  disableCircleSelection() {
    this.adapter.disableCircleSelection()
  }

  showRoute(route: Route | null) {
    this.adapter.drawRoute(route)
  }

  fitTo(points?: MapOrder['coordinates'][]) {
    this.adapter.fitBounds(points)
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.adapter.setViewportInsets(insets)
  }

  reframeToVisibleArea() {
    this.adapter.reframeToVisibleArea()
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    return this.adapter.subscribeBoundsChanged(callback)
  }

  resize(){
    this.adapter.resize()
  }

  clear() {
    this.adapter.clearMarkers()
    this.adapter.drawRoute(null)
  }

  destroy() {
    this.adapter.destroy()
  }
}
