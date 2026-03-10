declare const google: any

declare namespace google {
  namespace maps {
    type Map = any
    type Marker = any
    type Polyline = any
    type LatLng = any
    type LatLngBounds = any
    type LatLngLiteral = { lat: number; lng: number }
    const event: {
      trigger: (...args: any[]) => void
    }
  }
}
