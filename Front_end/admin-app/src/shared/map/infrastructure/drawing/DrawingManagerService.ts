import {
  DRAWING_SELECTION_CLEAR_EVENT,
  DRAWING_SELECTION_MODE_EVENT,
  type DrawingSelectionMode,
  type DrawingSelectionModeEventDetail,
} from '../../domain/constants/drawingSelectionModes'
import type { MapInstanceManager } from '../core/MapInstanceManager'
import type { MarkerMultiSelectionManager } from '../markers/MarkerMultiSelectionManager'
import type { ShapeSelectionService } from './ShapeSelectionService'

export class DrawingManagerService {
  private drawingManager: any = null
  private activeShape: any = null
  private circleSelectionCallback: ((ids: string[]) => void) | null = null
  private circleSelectionLayerId: string | null = null
  private shapeListeners: any[] = []
  private drawingCompleteListener: any = null
  private hasDrawingModeListener = false
  private hasDrawingClearListener = false
  private mapInstanceManager: MapInstanceManager
  private shapeSelectionService: ShapeSelectionService
  private markerMultiSelectionManager: MarkerMultiSelectionManager

  constructor(
    mapInstanceManager: MapInstanceManager,
    shapeSelectionService: ShapeSelectionService,
    markerMultiSelectionManager: MarkerMultiSelectionManager,
  ) {
    this.mapInstanceManager = mapInstanceManager
    this.shapeSelectionService = shapeSelectionService
    this.markerMultiSelectionManager = markerMultiSelectionManager
  }

  enableCircleSelection(params: { layerId: string; callback: (ids: string[]) => void }) {
    if (!this.mapInstanceManager.getMap()) return

    this.circleSelectionCallback = params.callback
    this.circleSelectionLayerId = params.layerId
    this.markerMultiSelectionManager.setActiveLayer(params.layerId)

    this.ensureDrawingManager()

    if (!this.drawingManager) return

    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE)
  }

  disableCircleSelection() {
    this.circleSelectionCallback = null

    this.clearShapeListeners()
    if (this.activeShape) {
      this.activeShape.setMap(null)
      this.activeShape = null
    }

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null)
    }

    this.markerMultiSelectionManager.clearMultiSelectionStyles(this.circleSelectionLayerId ?? undefined)
    this.markerMultiSelectionManager.clearSelectedIds()
    this.circleSelectionLayerId = null
    this.markerMultiSelectionManager.setActiveLayer(null)
  }

  handleLayerCleared(layerId: string) {
    if (layerId !== this.circleSelectionLayerId) {
      return
    }

    this.markerMultiSelectionManager.clearMultiSelectionStyles(layerId)
    this.markerMultiSelectionManager.clearSelectedIds()
  }

  destroy() {
    this.disableCircleSelection()

    if (this.drawingCompleteListener) {
      this.drawingCompleteListener.remove?.()
      google.maps.event.removeListener(this.drawingCompleteListener)
      this.drawingCompleteListener = null
    }

    if (this.drawingManager) {
      this.drawingManager.setMap(null)
      this.drawingManager = null
    }

    if (this.hasDrawingModeListener && typeof window !== 'undefined') {
      window.removeEventListener(DRAWING_SELECTION_MODE_EVENT, this.handleDrawingModeSelection as EventListener)
      this.hasDrawingModeListener = false
    }

    if (this.hasDrawingClearListener && typeof window !== 'undefined') {
      window.removeEventListener(DRAWING_SELECTION_CLEAR_EVENT, this.handleDrawingSelectionClear as EventListener)
      this.hasDrawingClearListener = false
    }
  }

  getActiveLayerId() {
    return this.circleSelectionLayerId
  }

  private ensureDrawingManager() {
    const map = this.mapInstanceManager.getMap()
    if (!map) return

    if (!google.maps.drawing?.DrawingManager) {
      console.error('Google Maps drawing library is not loaded')
      return
    }

    if (!this.drawingManager) {
      const sharedOverlayStyle = {
        editable: true,
        fillColor: '#2563eb',
        fillOpacity: 0.12,
        strokeColor: '#1d4ed8',
        strokeOpacity: 0.9,
        strokeWeight: 2,
      }

      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        circleOptions: {
          ...sharedOverlayStyle,
          draggable: true,
        },
        rectangleOptions: sharedOverlayStyle,
        polygonOptions: sharedOverlayStyle,
      })
      this.drawingManager.setMap(map)
    }

    if (!this.drawingCompleteListener) {
      this.drawingCompleteListener = google.maps.event.addListener(
        this.drawingManager,
        'overlaycomplete',
        (event: any) => {
          this.handleOverlayComplete(event)
        },
      )
    }

    if (!this.hasDrawingModeListener && typeof window !== 'undefined') {
      window.addEventListener(DRAWING_SELECTION_MODE_EVENT, this.handleDrawingModeSelection as EventListener)
      this.hasDrawingModeListener = true
    }

    if (!this.hasDrawingClearListener && typeof window !== 'undefined') {
      window.addEventListener(DRAWING_SELECTION_CLEAR_EVENT, this.handleDrawingSelectionClear as EventListener)
      this.hasDrawingClearListener = true
    }
  }

  private handleOverlayComplete(event: any) {
    const overlay = event?.overlay
    const overlayType = event?.type

    this.clearShapeListeners()

    if (this.activeShape) {
      this.activeShape.setMap(null)
    }

    this.activeShape = overlay

    if (overlayType === google.maps.drawing.OverlayType.CIRCLE) {
      overlay?.setEditable?.(true)
      overlay?.setDraggable?.(true)
      this.shapeListeners.push(
        google.maps.event.addListener(overlay, 'center_changed', () => this.computeCircleSelection(overlay)),
      )
      this.shapeListeners.push(
        google.maps.event.addListener(overlay, 'radius_changed', () => this.computeCircleSelection(overlay)),
      )
      this.computeCircleSelection(overlay)
    } else if (overlayType === google.maps.drawing.OverlayType.RECTANGLE) {
      overlay?.setEditable?.(true)
      this.shapeListeners.push(
        google.maps.event.addListener(overlay, 'bounds_changed', () => this.computeRectangleSelection(overlay)),
      )
      this.computeRectangleSelection(overlay)
    } else if (overlayType === google.maps.drawing.OverlayType.POLYGON) {
      overlay?.setEditable?.(true)
      const path = overlay?.getPath?.()

      if (path) {
        this.shapeListeners.push(
          google.maps.event.addListener(path, 'set_at', () => this.computePolygonSelection(overlay)),
        )
        this.shapeListeners.push(
          google.maps.event.addListener(path, 'insert_at', () => this.computePolygonSelection(overlay)),
        )
        this.shapeListeners.push(
          google.maps.event.addListener(path, 'remove_at', () => this.computePolygonSelection(overlay)),
        )
      }

      this.computePolygonSelection(overlay)
    }

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null)
    }
  }

  private computeCircleSelection(circle: any) {
    this.shapeSelectionService.computeCircleSelection(circle, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    })
  }

  private computeRectangleSelection(rectangle: any) {
    this.shapeSelectionService.computeRectangleSelection(rectangle, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    })
  }

  private computePolygonSelection(polygon: any) {
    this.shapeSelectionService.computePolygonSelection(polygon, {
      activeLayerId: this.circleSelectionLayerId,
      callback: this.circleSelectionCallback,
    })
  }

  private handleDrawingModeSelection = (event: Event) => {
    if (!this.drawingManager || !this.circleSelectionLayerId || !this.circleSelectionCallback) {
      return
    }

    const detail = (event as CustomEvent<DrawingSelectionModeEventDetail>).detail
    const mode = detail?.mode
    const overlayType = this.resolveOverlayType(mode)

    if (!overlayType) {
      return
    }

    this.clearActiveShapeSelection()
    this.drawingManager.setDrawingMode(overlayType)
  }

  private handleDrawingSelectionClear = () => {
    if (!this.drawingManager || !this.circleSelectionLayerId || !this.circleSelectionCallback) {
      return
    }

    this.clearActiveShapeSelection()

    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(null)
    }
  }

  private resolveOverlayType(mode: DrawingSelectionMode | undefined) {
    if (mode === 'rectangle') {
      return google.maps.drawing.OverlayType.RECTANGLE
    }
    if (mode === 'polygon') {
      return google.maps.drawing.OverlayType.POLYGON
    }
    if (mode === 'circle') {
      return google.maps.drawing.OverlayType.CIRCLE
    }
    return null
  }

  private clearActiveShapeSelection() {
    this.clearShapeListeners()
    if (this.activeShape) {
      this.activeShape.setMap(null)
      this.activeShape = null
    }

    this.markerMultiSelectionManager.clearMultiSelectionStyles(this.circleSelectionLayerId ?? undefined)
    this.markerMultiSelectionManager.clearSelectedIds()
    this.circleSelectionCallback?.([])
  }

  private clearShapeListeners() {
    this.shapeListeners.forEach((listener) => {
      listener?.remove?.()
      google.maps.event.removeListener(listener)
    })
    this.shapeListeners = []
  }
}

