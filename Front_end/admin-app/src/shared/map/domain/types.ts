import type { MapOrder } from "./entities/MapOrder";
import type { Route } from "./entities/Route";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type MapViewportInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type GeoJSONPolygonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

export type SetMarkerLayerOptions = {
  fitBounds?: boolean;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type MapConfig = {
  center?: Coordinates;
  zoom?: number;
  mapId?: string;
  disableDefaultUI?: boolean;
};

export type ZoneLayerOptions = {
  onHover: (zoneId: number | null) => void;
  onClick: (zoneId: number) => void;
};

export type MapBridge = {
  initialize: (
    container: HTMLElement | null,
    options?: MapConfig,
  ) => Promise<void>;
  showOrders: (orders: MapOrder[]) => void;
  setMarkerLayer: (
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) => void;
  setMarkerLayerVisibility: (layerId: string, visible: boolean) => void;
  clearMarkerLayer: (layerId: string) => void;
  enableCircleSelection: (params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) => void;
  disableCircleSelection: () => void;
  enableZoneCapture: (callback: (geometry: GeoJSONPolygon) => void) => void;
  disableZoneCapture: () => void;
  showRoute: (route: Route | null) => void;
  selectOrder: (id: number | string) => void;
  setSelectedMarker: (id: string | null) => void;
  setHoveredMarker: (id: string | null) => void;
  setViewportInsets: (insets: MapViewportInsets) => void;
  reframeToVisibleArea: () => void;
  setZonePolygonOverlay: (geometry: GeoJSONPolygonGeometry | null) => void;
  clearZonePolygonOverlay: () => void;
  setZoneLayer: (zones: ZoneDefinition[], options: ZoneLayerOptions) => void;
  clearZoneLayer: () => void;
  subscribeBoundsChanged: (
    callback: (bounds: MapBounds | null) => void,
  ) => () => void;
  resize: () => void;
};

export interface MapAdapter {
  initialize: (container: HTMLElement, options?: MapConfig) => Promise<void>;
  setMarkers: (orders: MapOrder[]) => void;
  setLayerMarkers: (
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) => void;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  clearLayer: (layerId: string) => void;
  enableCircleSelection: (params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) => void;
  disableCircleSelection: () => void;
  enableZoneCapture: (callback: (geometry: GeoJSONPolygon) => void) => void;
  disableZoneCapture: () => void;
  clearMarkers: () => void;
  drawRoute: (route: Route | null) => void;
  fitBounds: (points?: Coordinates[]) => void;
  selectMarker: (id: string) => void;
  setSelectedMarker: (id: string | null) => void;
  setHoveredMarker: (id: string | null) => void;
  setViewportInsets: (insets: MapViewportInsets) => void;
  reframeToVisibleArea: () => void;
  setZonePolygonOverlay: (geometry: GeoJSONPolygonGeometry | null) => void;
  clearZonePolygonOverlay: () => void;
  setZoneLayer: (zones: ZoneDefinition[], options: ZoneLayerOptions) => void;
  clearZoneLayer: () => void;
  subscribeBoundsChanged: (
    callback: (bounds: MapBounds | null) => void,
  ) => () => void;
  destroy: () => void;
  resize: () => void;
}
