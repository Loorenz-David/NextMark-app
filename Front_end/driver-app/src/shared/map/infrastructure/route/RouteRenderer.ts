import type { MapRoute } from '../../domain/entities/MapRoute'
import type { Coordinates } from '../../domain/types'
import type { MapInstanceManager } from '../core/MapInstanceManager'

export class RouteRenderer {
  private routePolylines: Array<{
    setMap: (map: unknown) => void
    getPath?: () => { getArray: () => Array<{ lat(): number; lng(): number }> }
  }> = []
  private mapInstanceManager: MapInstanceManager
  private onRouteRendered: (points: Coordinates[]) => void

  constructor(mapInstanceManager: MapInstanceManager, onRouteRendered: (points: Coordinates[]) => void) {
    this.mapInstanceManager = mapInstanceManager
    this.onRouteRendered = onRouteRendered
  }

  drawRoute(route: MapRoute | null) {
    const map = this.mapInstanceManager.getMap()
    const PolylineCtor = this.mapInstanceManager.getPolylineCtor()

    if (!map || !PolylineCtor) {
      return
    }

    this.clearRoute()

    if (!route?.path) {
      return
    }

    let encodedPolylines: string[] = []

    if (typeof route.path === 'string') {
      encodedPolylines = [route.path]
    } else if (Array.isArray(route.path) && typeof route.path[0] === 'string') {
      encodedPolylines = route.path as string[]
    } else {
      return
    }

    if (!google.maps.geometry?.encoding) {
      return
    }

    const allPoints: Coordinates[] = []

    encodedPolylines.forEach((encodedPolyline) => {
      const decoded = google.maps.geometry.encoding.decodePath(encodedPolyline)

      const path = decoded.map((point: { lat(): number; lng(): number }) => ({
        lat: point.lat(),
        lng: point.lng(),
      }))

      const polyline = new PolylineCtor({
        map,
        path,
        strokeColor: '#0f766e',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      })

      this.routePolylines.push(polyline)
      allPoints.push(...path)
    })

    if (allPoints.length) {
      this.onRouteRendered(allPoints)
    }
  }

  getRoutePoints() {
    const points: Coordinates[] = []

    this.routePolylines.forEach((polyline) => {
      const path = polyline.getPath?.()
      if (!path || typeof path.getArray !== 'function') {
        return
      }

      path.getArray().forEach((point: { lat(): number; lng(): number }) => {
        points.push({ lat: point.lat(), lng: point.lng() })
      })
    })

    return points
  }

  clearRoute() {
    this.routePolylines.forEach((polyline) => polyline.setMap(null))
    this.routePolylines = []
  }

  destroy() {
    this.clearRoute()
  }
}
