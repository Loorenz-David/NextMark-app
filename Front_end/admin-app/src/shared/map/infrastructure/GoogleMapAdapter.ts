import { loadGoogleMaps } from '@shared-google-maps'

import { MAP_MARKER_LAYERS } from '../domain/constants/markerLayers'
import type { MapOrder } from '../domain/entities/MapOrder'
import type { Route } from '../domain/entities/Route'
import type { Coordinates, MapAdapter, MapBounds, MapConfig, MapViewportInsets, SetMarkerLayerOptions } from '../domain/types'
import { LocateControlManager } from './controls/LocateControlManager'
import { DrawingManagerService } from './drawing/DrawingManagerService'
import { ShapeSelectionService } from './drawing/ShapeSelectionService'
import { MapInstanceManager } from './core/MapInstanceManager'
import { ViewportManager } from './core/ViewportManager'
import { UserLocationManager } from './location/UserLocationManager'
import { MarkerLayerManager } from './markers/MarkerLayerManager'
import { MarkerMultiSelectionManager } from './markers/MarkerMultiSelectionManager'
import { MarkerSelectionManager } from './markers/MarkerSelectionManager'
import { RouteRenderer } from './route/RouteRenderer'

export class GoogleMapAdapter implements MapAdapter {
  private readonly mapInstanceManager: MapInstanceManager
  private readonly markerLayerManager: MarkerLayerManager
  private readonly markerSelectionManager: MarkerSelectionManager
  private readonly markerMultiSelectionManager: MarkerMultiSelectionManager
  private readonly shapeSelectionService: ShapeSelectionService
  private readonly drawingManagerService: DrawingManagerService
  private readonly routeRenderer: RouteRenderer
  private readonly viewportManager: ViewportManager
  private readonly userLocationManager: UserLocationManager
  private readonly locateControlManager: LocateControlManager
  private boundsChangedListeners = new Set<(bounds: MapBounds | null) => void>()
  private idleListener: any = null

  constructor() {
    let routeFitBoundsCallback: (points: Coordinates[]) => void = () => undefined

    this.mapInstanceManager = new MapInstanceManager(loadGoogleMaps)
    this.markerLayerManager = new MarkerLayerManager(this.mapInstanceManager)
    this.markerSelectionManager = new MarkerSelectionManager(this.markerLayerManager)
    this.markerMultiSelectionManager = new MarkerMultiSelectionManager(this.markerLayerManager)
    this.shapeSelectionService = new ShapeSelectionService(
      this.markerLayerManager,
      this.markerMultiSelectionManager,
    )
    this.drawingManagerService = new DrawingManagerService(
      this.mapInstanceManager,
      this.shapeSelectionService,
      this.markerMultiSelectionManager,
    )
    this.routeRenderer = new RouteRenderer(this.mapInstanceManager, (points) => {
      routeFitBoundsCallback(points)
    })
    this.viewportManager = new ViewportManager(
      this.mapInstanceManager,
      this.markerLayerManager,
      this.routeRenderer,
    )
    routeFitBoundsCallback = (points) => this.viewportManager.fitBounds(points)
    this.userLocationManager = new UserLocationManager(this.mapInstanceManager)
    this.locateControlManager = new LocateControlManager(this.mapInstanceManager, this.userLocationManager)
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.mapInstanceManager.initialize(container, options)
    this.bindBoundsChangedListener()

    this.userLocationManager.clearUserLocationMarker()
    this.locateControlManager.unmountLocateControl()
    this.viewportManager.applyViewportInsets()

    this.userLocationManager.mountUserLocationMarker()
    this.locateControlManager.mountLocateControl()

    this.markerLayerManager.replayLayerSnapshots((points) => {
      this.viewportManager.fitBounds(points)
    })

    this.markerSelectionManager.reconcileSelectionState()
    this.markerSelectionManager.reapplySelectionStyles()

    const activeLayerId = this.drawingManagerService.getActiveLayerId()
    if (activeLayerId) {
      this.markerMultiSelectionManager.syncLayerStyles(activeLayerId)
    }
  }

  setMarkers(orders: MapOrder[]) {
    this.setLayerMarkers(MAP_MARKER_LAYERS.default, orders, { fitBounds: true })
  }

  setLayerMarkers(layerId: string, orders: MapOrder[], options?: SetMarkerLayerOptions) {
    const { shouldFitBounds, removedIds } = this.markerLayerManager.setLayerMarkers(layerId, orders, options)

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds)
    }

    this.markerSelectionManager.reconcileSelectionState()
    this.markerSelectionManager.reapplySelectionStyles()
    this.markerMultiSelectionManager.syncLayerStyles(layerId)

    if (shouldFitBounds) {
      this.viewportManager.fitBounds(orders.map((order) => order.coordinates))
    }
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    this.markerLayerManager.setLayerVisibility(layerId, visible)
    this.markerMultiSelectionManager.syncLayerStyles(layerId)
  }

  clearLayer(layerId: string) {
    const removedIds = this.markerLayerManager.clearLayer(layerId)

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds)
    }

    this.drawingManagerService.handleLayerCleared(layerId)
    this.markerSelectionManager.reconcileSelectionState()
    this.markerSelectionManager.reapplySelectionStyles()
  }

  clearMarkers() {
    const removedIds = this.markerLayerManager.clearMarkers()

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds)
    }

    this.markerSelectionManager.reset()
    this.drawingManagerService.disableCircleSelection()
  }

  enableCircleSelection(params: { layerId: string; callback: (ids: string[]) => void }) {
    this.drawingManagerService.enableCircleSelection(params)
  }

  disableCircleSelection() {
    this.drawingManagerService.disableCircleSelection()
  }

  selectMarker(id: string) {
    this.markerSelectionManager.selectMarker(id)
  }

  setSelectedMarker(id: string | null) {
    this.markerSelectionManager.setSelectedMarker(id)
  }

  setHoveredMarker(id: string | null) {
    this.markerSelectionManager.setHoveredMarker(id)
  }

  drawRoute(route: Route | null) {
    this.routeRenderer.drawRoute(route)
  }

  fitBounds(points?: Coordinates[]) {
    this.viewportManager.fitBounds(points)
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.viewportManager.setViewportInsets(insets)
  }

  reframeToVisibleArea() {
    this.viewportManager.reframeToVisibleArea()
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    this.boundsChangedListeners.add(callback)
    callback(this.resolveBounds())

    return () => {
      this.boundsChangedListeners.delete(callback)
    }
  }

  destroy() {
    this.idleListener?.remove?.()
    this.idleListener = null
    this.boundsChangedListeners.clear()
    this.clearMarkers()
    this.userLocationManager.clearUserLocationMarker()
    this.locateControlManager.unmountLocateControl()
    this.drawingManagerService.destroy()
    this.routeRenderer.destroy()
    this.mapInstanceManager.destroy()
  }

  resize() {
    this.mapInstanceManager.resize(() => {
      this.viewportManager.applyViewportInsets()
    })
  }

  private bindBoundsChangedListener() {
    this.idleListener?.remove?.()
    const map = this.mapInstanceManager.getMap()
    if (!map || !google?.maps?.event?.addListener) {
      return
    }

    this.idleListener = google.maps.event.addListener(map, 'idle', () => {
      const bounds = this.resolveBounds()
      this.boundsChangedListeners.forEach((listener) => listener(bounds))
    })
  }

  private resolveBounds(): MapBounds | null {
    const map = this.mapInstanceManager.getMap()
    const bounds = map?.getBounds?.()
    if (!bounds) {
      return null
    }

    const northEast = bounds.getNorthEast?.()
    const southWest = bounds.getSouthWest?.()
    if (!northEast || !southWest) {
      return null
    }

    return {
      north: northEast.lat(),
      east: northEast.lng(),
      south: southWest.lat(),
      west: southWest.lng(),
    }
  }
}
