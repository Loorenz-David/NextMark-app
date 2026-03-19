import type { MapOrder } from '../../domain/entities/MapOrder'
import type { Coordinates, SetMarkerLayerOptions } from '../../domain/types'
import {
  applyMarkerContent,
  applyOperationBadges,
  createMarkerElement,
} from '../../presentation/mapMarkerElement.factory'
import type { MapInstanceManager } from '../core/MapInstanceManager'

export type LayerMarkerRecord = {
  marker: any
  el: HTMLElement
  order: MapOrder
}

export type MarkerLayer = {
  visible: boolean
  markers: Map<string, LayerMarkerRecord>
}

const markerZIndex = (status?: string) => {
  if (status === 'start' || status === 'end') {
    return 1
  }

  return 10
}

const getInteractionVariant = (order: MapOrder) => order.interactionVariant ?? 'default'

const addClassTokens = (el: HTMLElement, className?: string | null) => {
  if (!className) return
  const tokens = className.split(/\s+/).filter(Boolean)
  if (!tokens.length) return
  el.classList.add(...tokens)
}

const applyBaseMarkerAppearance = (el: HTMLElement, order: MapOrder) => {
  const interactionVariant = getInteractionVariant(order)
  el.className = 'map-marker'

  if (order.markerColor) {
    el.style.setProperty('--marker-bg', order.markerColor)
  } else {
    el.style.removeProperty('--marker-bg')
  }

  el.dataset.markerVariant = interactionVariant
  el.classList.add(`map-marker--variant-${interactionVariant}`)

  if (order.status) {
    el.classList.add(`${order.status}-marker`)
  }

  if (order.className) {
    addClassTokens(el, order.className)
  }

  applyMarkerContent(el, order.label)
  applyOperationBadges(el, order.operationBadgeDirections)
}

export class MarkerLayerManager {
  private layers = new Map<string, MarkerLayer>()
  private layerSnapshots = new Map<string, MapOrder[]>()
  private mapInstanceManager: MapInstanceManager

  constructor(mapInstanceManager: MapInstanceManager) {
    this.mapInstanceManager = mapInstanceManager
  }

  setLayerMarkers(layerId: string, orders: MapOrder[], options?: SetMarkerLayerOptions) {
    const map = this.mapInstanceManager.getMap()
    const AdvancedMarkerCtor = this.mapInstanceManager.getAdvancedMarkerCtor()

    const layer = this.getOrCreateLayer(layerId)
    this.layerSnapshots.set(layerId, orders)

    if (!AdvancedMarkerCtor) {
      return { shouldFitBounds: false, removedIds: [] as string[] }
    }

    const nextIds = new Set(orders.map((order) => String(order.id)))
    const removedIds: string[] = []

    Array.from(layer.markers.entries()).forEach(([id, entry]) => {
      if (!nextIds.has(id)) {
        entry.marker.map = null
        entry.el.onclick = null
        entry.el.onmouseenter = null
        entry.el.onmouseleave = null
        layer.markers.delete(id)
        removedIds.push(id)
      }
    })

    orders.forEach((order) => {
      const id = String(order.id)
      const existing = layer.markers.get(id)

      if (existing) {
        existing.order = order
        existing.marker.position = order.coordinates
        existing.marker.zIndex = markerZIndex(order.status)
        applyBaseMarkerAppearance(existing.el, order)
        existing.el.onclick = (event: MouseEvent) => {
          order.onClick?.(event)
        }
        existing.el.onmouseenter = (event: MouseEvent) => {
          order.onMouseEnter?.(event)
        }
        existing.el.onmouseleave = (event: MouseEvent) => {
          order.onMouseLeave?.(event)
        }
        existing.marker.map = layer.visible ? map : null
        return
      }

      const content = createMarkerElement(order)
      content.onclick = (event: MouseEvent) => {
        order.onClick?.(event)
      }
      content.onmouseenter = (event: MouseEvent) => {
        order.onMouseEnter?.(event)
      }
      content.onmouseleave = (event: MouseEvent) => {
        order.onMouseLeave?.(event)
      }

      const marker = new AdvancedMarkerCtor({
        map: layer.visible ? map : null,
        position: order.coordinates,
        content,
        zIndex: markerZIndex(order.status),
      })

      layer.markers.set(id, { marker, el: content, order })
    })

    return {
      shouldFitBounds: Boolean(options?.fitBounds) && layer.visible && orders.length > 0,
      removedIds,
    }
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    const map = this.mapInstanceManager.getMap()
    const layer = this.layers.get(layerId)
    if (!layer) return

    layer.visible = visible
    layer.markers.forEach(({ marker }) => {
      marker.map = visible ? map : null
    })
  }

  clearLayer(layerId: string) {
    const layer = this.layers.get(layerId)
    if (!layer) {
      return [] as string[]
    }

    const removedIds: string[] = []
    layer.markers.forEach(({ marker, el }, id) => {
      marker.map = null
      el.onclick = null
      el.onmouseenter = null
      el.onmouseleave = null
      removedIds.push(id)
    })
    layer.markers.clear()
    this.layers.delete(layerId)
    this.layerSnapshots.delete(layerId)

    return removedIds
  }

  clearMarkers() {
    const removedIds: string[] = []
    Array.from(this.layers.keys()).forEach((layerId) => {
      removedIds.push(...this.clearLayer(layerId))
    })
    return removedIds
  }

  replayLayerSnapshots(onVisibleOrders: (points: Coordinates[]) => void) {
    if (!this.mapInstanceManager.getAdvancedMarkerCtor()) return

    this.layerSnapshots.forEach((orders, layerId) => {
      this.setLayerMarkers(layerId, orders)
      const layer = this.layers.get(layerId)
      if (layer) {
        this.setLayerVisibility(layerId, layer.visible)
      }
      if (layer?.visible && orders.length) {
        onVisibleOrders(orders.map((order) => order.coordinates))
      }
    })
  }

  getOrCreateLayer(layerId: string) {
    const existing = this.layers.get(layerId)
    if (existing) {
      return existing
    }

    const created: MarkerLayer = {
      visible: true,
      markers: new Map(),
    }

    this.layers.set(layerId, created)
    return created
  }

  findMarkerEntryById(id: string): { layerId: string; entry: LayerMarkerRecord } | null {
    for (const [layerId, layer] of this.layers.entries()) {
      const entry = layer.markers.get(id)
      if (entry) {
        return { layerId, entry }
      }
    }

    return null
  }

  getLayer(layerId: string) {
    return this.layers.get(layerId) ?? null
  }

  getLayers() {
    return this.layers
  }

  getVisibleMarkerPoints() {
    const points: Coordinates[] = []

    this.layers.forEach((layer) => {
      if (!layer.visible) return

      layer.markers.forEach(({ marker }) => {
        const position = marker.position
        if (!position) return

        if (typeof (position as any).lat === 'function') {
          points.push({
            lat: (position as any).lat(),
            lng: (position as any).lng(),
          })
          return
        }

        const coords = position as Coordinates
        if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          points.push(coords)
        }
      })
    })

    return points
  }
}
