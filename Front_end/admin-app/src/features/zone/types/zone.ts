type GeoJSONPosition = [number, number];
type GeoJSONLinearRing = GeoJSONPosition[];

export type GeoJSONPolygon = {
  type: "Polygon" | "MultiPolygon";
  coordinates: GeoJSONLinearRing[] | GeoJSONLinearRing[][];
};

export type ZoneTemplateConfig = {
  vehicle_type_id?: number | null;
  default_service_time_seconds?: number | null;
  depot_id?: number | null;
  max_stops?: number | null;
  constraints?: Record<string, unknown> | null;
};

export type ZoneTemplate = {
  id?: number;
  zone_id?: number;
  name?: string | null;
  config_json?: ZoneTemplateConfig | null;
  version?: number | null;
  is_active?: boolean;
};

export type ZoneTemplateRef = {
  id?: number;
  name?: string | null;
  version?: number | null;
  is_active?: boolean;
};

export type ZoneCentroid = {
  lat: number | null;
  lng: number | null;
};

export type ZoneBBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type ZoneGeometryResolution = "none" | "simplified" | "full";

export type ZoneDefinition = {
  id?: number;
  team_id?: number;
  version_id?: number;
  name: string;
  zone_type?: "bootstrap" | "system" | "user" | null;
  centroid_lat?: number | null;
  centroid_lng?: number | null;
  min_lat?: number | null;
  max_lat?: number | null;
  min_lng?: number | null;
  max_lng?: number | null;
  geometry?: GeoJSONPolygon | null;
  is_active?: boolean;
  template?: ZoneTemplate | null;
};

export type ZoneLite = {
  id: number;
  version_id: number;
  team_id?: number;
  name: string;
  zone_type?: "bootstrap" | "system" | "user" | null;
  centroid: ZoneCentroid | null;
  bbox: ZoneBBox;
  geometry_simplified?: GeoJSONPolygon | null;
  geometry_resolution: ZoneGeometryResolution;
  template_ref?: ZoneTemplateRef | null;
  is_active?: boolean;
};

export type ZoneState = {
  id: number;
  version_id: number;
  team_id?: number;
  name: string;
  zone_type?: "bootstrap" | "system" | "user" | null;
  is_active: boolean;
  centroid: ZoneCentroid | null;
  bbox: ZoneBBox;
  geometry_simplified: GeoJSONPolygon | null;
  geometry_full: GeoJSONPolygon | null;
  geometry_resolution: ZoneGeometryResolution;
  template_ref: ZoneTemplateRef | null;
  template_full: ZoneTemplate | null;
  is_loading_geometry: boolean;
  is_loading_template: boolean;
  geometry_error: string | null;
  template_error: string | null;
  lastFetchedAt?: string | null;
};

export type ZonesContext = {
  version_id: number;
  zones: ZoneLite[];
};

export type ZoneVersion = {
  id?: number;
  team_id?: number;
  city_key: string;
  version_number?: number;
  is_active?: boolean;
  created_at?: string | null;
};
