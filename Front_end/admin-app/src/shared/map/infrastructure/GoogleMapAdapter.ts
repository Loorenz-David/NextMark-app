import { loadGoogleMaps } from "@shared-google-maps";

import { MAP_MARKER_LAYERS } from "../domain/constants/markerLayers";
import type { MapOrder } from "../domain/entities/MapOrder";
import type { Route } from "../domain/entities/Route";
import type {
  Coordinates,
  GeoJSONPolygonGeometry,
  MapAdapter,
  MapBounds,
  MapConfig,
  MapViewportInsets,
  SetMarkerLayerOptions,
  ZoneLayerOptions,
} from "../domain/types";
import type { GeoJSONPolygon, ZoneDefinition } from "@/features/zone/types";
import { LocateControlManager } from "./controls/LocateControlManager";
import { DrawingManagerService } from "./drawing/DrawingManagerService";
import { ShapeSelectionService } from "./drawing/ShapeSelectionService";
import { MapInstanceManager } from "./core/MapInstanceManager";
import { ViewportManager } from "./core/ViewportManager";
import { UserLocationManager } from "./location/UserLocationManager";
import { MarkerLayerManager } from "./markers/MarkerLayerManager";
import { MarkerMultiSelectionManager } from "./markers/MarkerMultiSelectionManager";
import { MarkerSelectionManager } from "./markers/MarkerSelectionManager";
import { RouteRenderer } from "./route/RouteRenderer";

export class GoogleMapAdapter implements MapAdapter {
  private readonly mapInstanceManager: MapInstanceManager;
  private readonly markerLayerManager: MarkerLayerManager;
  private readonly markerSelectionManager: MarkerSelectionManager;
  private readonly markerMultiSelectionManager: MarkerMultiSelectionManager;
  private readonly shapeSelectionService: ShapeSelectionService;
  private readonly drawingManagerService: DrawingManagerService;
  private readonly routeRenderer: RouteRenderer;
  private readonly viewportManager: ViewportManager;
  private readonly userLocationManager: UserLocationManager;
  private readonly locateControlManager: LocateControlManager;
  private boundsChangedListeners = new Set<
    (bounds: MapBounds | null) => void
  >();
  private idleListener: any = null;
  private zoneOverlayPolygons: any[] = [];
  private zoneLayerPolygons: any[] = [];
  private zoneLabelMarkers: any[] = [];

  constructor() {
    let routeFitBoundsCallback: (points: Coordinates[]) => void = () =>
      undefined;

    this.mapInstanceManager = new MapInstanceManager(loadGoogleMaps);
    this.markerLayerManager = new MarkerLayerManager(this.mapInstanceManager);
    this.markerSelectionManager = new MarkerSelectionManager(
      this.markerLayerManager,
    );
    this.markerMultiSelectionManager = new MarkerMultiSelectionManager(
      this.markerLayerManager,
    );
    this.shapeSelectionService = new ShapeSelectionService(
      this.markerLayerManager,
      this.markerMultiSelectionManager,
    );
    this.drawingManagerService = new DrawingManagerService(
      this.mapInstanceManager,
      this.shapeSelectionService,
      this.markerMultiSelectionManager,
    );
    this.routeRenderer = new RouteRenderer(
      this.mapInstanceManager,
      (points) => {
        routeFitBoundsCallback(points);
      },
    );
    this.viewportManager = new ViewportManager(
      this.mapInstanceManager,
      this.markerLayerManager,
      this.routeRenderer,
    );
    routeFitBoundsCallback = (points) => this.viewportManager.fitBounds(points);
    this.userLocationManager = new UserLocationManager(this.mapInstanceManager);
    this.locateControlManager = new LocateControlManager(
      this.mapInstanceManager,
      this.userLocationManager,
    );
  }

  async initialize(container: HTMLElement, options?: MapConfig) {
    await this.mapInstanceManager.initialize(container, options);
    this.bindBoundsChangedListener();

    this.userLocationManager.clearUserLocationMarker();
    this.locateControlManager.unmountLocateControl();
    this.viewportManager.applyViewportInsets();

    this.userLocationManager.mountUserLocationMarker();
    this.locateControlManager.mountLocateControl();

    this.markerLayerManager.replayLayerSnapshots((points) => {
      this.viewportManager.fitBounds(points);
    });

    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();

    const activeLayerId = this.drawingManagerService.getActiveLayerId();
    if (activeLayerId) {
      this.markerMultiSelectionManager.syncLayerStyles(activeLayerId);
    }
  }

  setMarkers(orders: MapOrder[]) {
    this.setLayerMarkers(MAP_MARKER_LAYERS.default, orders, {
      fitBounds: true,
    });
  }

  setLayerMarkers(
    layerId: string,
    orders: MapOrder[],
    options?: SetMarkerLayerOptions,
  ) {
    const { shouldFitBounds, removedIds } =
      this.markerLayerManager.setLayerMarkers(layerId, orders, options);

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();
    this.markerMultiSelectionManager.syncLayerStyles(layerId);

    if (shouldFitBounds) {
      this.viewportManager.fitBounds(orders.map((order) => order.coordinates));
    }
  }

  setLayerVisibility(layerId: string, visible: boolean) {
    this.markerLayerManager.setLayerVisibility(layerId, visible);
    this.markerMultiSelectionManager.syncLayerStyles(layerId);
  }

  clearLayer(layerId: string) {
    const removedIds = this.markerLayerManager.clearLayer(layerId);

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.drawingManagerService.handleLayerCleared(layerId);
    this.markerSelectionManager.reconcileSelectionState();
    this.markerSelectionManager.reapplySelectionStyles();
  }

  clearMarkers() {
    const removedIds = this.markerLayerManager.clearMarkers();

    if (removedIds.length) {
      this.markerMultiSelectionManager.removeIds(removedIds);
    }

    this.markerSelectionManager.reset();
    this.drawingManagerService.disableCircleSelection();
  }

  enableCircleSelection(params: {
    layerId: string;
    callback: (ids: string[]) => void;
  }) {
    this.drawingManagerService.enableCircleSelection(params);
  }

  disableCircleSelection() {
    this.drawingManagerService.disableCircleSelection();
  }

  enableZoneCapture(callback: (geometry: GeoJSONPolygon) => void) {
    this.drawingManagerService.enableZoneCapture(callback);
  }

  disableZoneCapture() {
    this.drawingManagerService.disableZoneCapture();
  }

  selectMarker(id: string) {
    this.markerSelectionManager.selectMarker(id);
  }

  setSelectedMarker(id: string | null) {
    this.markerSelectionManager.setSelectedMarker(id);
  }

  setHoveredMarker(id: string | null) {
    this.markerSelectionManager.setHoveredMarker(id);
  }

  drawRoute(route: Route | null) {
    this.routeRenderer.drawRoute(route);
  }

  fitBounds(points?: Coordinates[]) {
    this.viewportManager.fitBounds(points);
  }

  setViewportInsets(insets: MapViewportInsets) {
    this.viewportManager.setViewportInsets(insets);
  }

  reframeToVisibleArea() {
    this.viewportManager.reframeToVisibleArea();
  }

  setZonePolygonOverlay(geometry: GeoJSONPolygonGeometry | null) {
    this.clearZonePolygonOverlay();

    const map = this.mapInstanceManager.getMap();
    const PolygonCtor = (google as any)?.maps?.Polygon;

    if (!map || !geometry || !PolygonCtor) {
      return;
    }

    const polygonGroups = this.normalizePolygonGroups(geometry);
    polygonGroups.forEach((polygonCoordinates) => {
      const paths = polygonCoordinates
        .map((ring) => this.normalizeRing(ring))
        .filter((ring) => ring.length >= 3);

      if (paths.length === 0) {
        return;
      }

      const polygon = new PolygonCtor({
        map,
        paths,
        clickable: false,
        strokeColor: "#1f8ef1",
        strokeOpacity: 0.72,
        strokeWeight: 2,
        fillColor: "#4fb3ff",
        fillOpacity: 0.12,
        zIndex: 1,
      });

      this.zoneOverlayPolygons.push(polygon);
    });
  }

  clearZonePolygonOverlay() {
    this.zoneOverlayPolygons.forEach((polygon) => {
      polygon?.setMap?.(null);
    });
    this.zoneOverlayPolygons = [];
  }

  setZoneLayer(zones: ZoneDefinition[], options: ZoneLayerOptions) {
    this.clearZoneLayer();

    const map = this.mapInstanceManager.getMap();
    const googleMaps = (globalThis as any)?.google?.maps;
    const PolygonCtor = googleMaps?.Polygon;
    const MarkerCtor = googleMaps?.marker?.AdvancedMarkerElement;

    if (!map || !PolygonCtor) {
      return;
    }

    zones.forEach((zone) => {
      const zoneId = typeof zone.id === "number" ? zone.id : null;
      const geometry = zone.geometry;

      if (!zoneId || !geometry || !Array.isArray(geometry.coordinates)) {
        return;
      }

      const exteriorRing = this.resolveExteriorRing(geometry);
      const paths = exteriorRing
        .map((point) => {
          if (!Array.isArray(point) || point.length < 2) return null;
          const lng = Number(point[0]);
          const lat = Number(point[1]);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return { lat, lng };
        })
        .filter((point): point is { lat: number; lng: number } =>
          Boolean(point),
        );

      if (paths.length < 3) {
        return;
      }

      const polygon = new PolygonCtor({
        paths,
        map,
        fillColor: "#2563eb",
        fillOpacity: 0.08,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.7,
        strokeWeight: 2,
      });

      const addListener = googleMaps?.event?.addListener;
      if (addListener) {
        addListener(polygon, "mouseover", () => options.onHover(zoneId));
        addListener(polygon, "mouseout", () => options.onHover(null));
        addListener(polygon, "click", () => options.onClick(zoneId));
      }

      this.zoneLayerPolygons.push(polygon);

      if (
        MarkerCtor &&
        Number.isFinite(zone.centroid_lat) &&
        Number.isFinite(zone.centroid_lng)
      ) {
        const label = document.createElement("div");
        label.className =
          "rounded-md border border-white/25 bg-black/50 px-2 py-1 text-xs font-semibold text-white";
        label.textContent = zone.name || `Zone ${zoneId}`;

        const marker = new MarkerCtor({
          map,
          position: {
            lat: Number(zone.centroid_lat),
            lng: Number(zone.centroid_lng),
          },
          content: label,
        });

        this.zoneLabelMarkers.push(marker);
      }
    });
  }

  clearZoneLayer() {
    const googleMaps = (globalThis as any)?.google?.maps;
    const mapEvents = googleMaps?.event;
    this.zoneLayerPolygons.forEach((polygon) => {
      mapEvents?.clearInstanceListeners?.(polygon);
      polygon?.setMap?.(null);
    });
    this.zoneLayerPolygons = [];

    this.zoneLabelMarkers.forEach((marker) => {
      marker.map = null;
    });
    this.zoneLabelMarkers = [];
  }

  subscribeBoundsChanged(callback: (bounds: MapBounds | null) => void) {
    this.boundsChangedListeners.add(callback);
    callback(this.resolveBounds());

    return () => {
      this.boundsChangedListeners.delete(callback);
    };
  }

  destroy() {
    this.idleListener?.remove?.();
    this.idleListener = null;
    this.boundsChangedListeners.clear();
    this.clearMarkers();
    this.userLocationManager.clearUserLocationMarker();
    this.locateControlManager.unmountLocateControl();
    this.drawingManagerService.destroy();
    this.routeRenderer.destroy();
    this.clearZonePolygonOverlay();
    this.clearZoneLayer();
    this.mapInstanceManager.destroy();
  }

  private resolveExteriorRing(geometry: GeoJSONPolygon): unknown[] {
    const coordinates = geometry.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return [];
    }

    if (geometry.type === "MultiPolygon") {
      const firstPolygon = coordinates[0];
      if (Array.isArray(firstPolygon) && Array.isArray(firstPolygon[0])) {
        return firstPolygon[0] as unknown[];
      }
      return [];
    }

    const firstRing = coordinates[0];
    if (Array.isArray(firstRing)) {
      return firstRing as unknown[];
    }

    return [];
  }

  private normalizeRing(ring: unknown): Array<{ lat: number; lng: number }> {
    if (!Array.isArray(ring)) {
      return [];
    }

    return ring
      .map((point) => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
      })
      .filter((point): point is { lat: number; lng: number } => Boolean(point));
  }

  private normalizePolygonGroups(
    geometry: GeoJSONPolygonGeometry,
  ): unknown[][][] {
    const coordinates = geometry.coordinates;

    if (!Array.isArray(coordinates)) {
      return [];
    }

    if (geometry.type === "MultiPolygon") {
      if (
        Array.isArray(coordinates[0]) &&
        Array.isArray((coordinates[0] as unknown[])[0]) &&
        Array.isArray(((coordinates[0] as unknown[])[0] as unknown[])[0])
      ) {
        return coordinates as unknown[][][];
      }
      return [coordinates as unknown[][]];
    }

    return [coordinates as unknown[][]];
  }

  resize() {
    this.mapInstanceManager.resize(() => {
      this.viewportManager.applyViewportInsets();
    });
  }

  private bindBoundsChangedListener() {
    this.idleListener?.remove?.();
    const map = this.mapInstanceManager.getMap();
    if (!map || !google?.maps?.event?.addListener) {
      return;
    }

    this.idleListener = google.maps.event.addListener(map, "idle", () => {
      const bounds = this.resolveBounds();
      this.boundsChangedListeners.forEach((listener) => listener(bounds));
    });
  }

  private resolveBounds(): MapBounds | null {
    const map = this.mapInstanceManager.getMap();
    const bounds = map?.getBounds?.();
    if (!bounds) {
      return null;
    }

    const northEast = bounds.getNorthEast?.();
    const southWest = bounds.getSouthWest?.();
    if (!northEast || !southWest) {
      return null;
    }

    return {
      north: northEast.lat(),
      east: northEast.lng(),
      south: southWest.lat(),
      west: southWest.lng(),
    };
  }
}
