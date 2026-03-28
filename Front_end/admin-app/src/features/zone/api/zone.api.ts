import { apiClient } from "@/lib/api/ApiClient";
import type { ApiResult } from "@/lib/api/types";
import type {
  GeoJSONPolygon,
  ZoneDefinition,
  ZoneTemplate,
  ZoneTemplateConfig,
  ZoneVersion,
} from "@/features/zone/types";

type CreateZoneVersionPayload = {
  city_key: string;
};

type CreateZonePayload = {
  name: string;
  zone_type?: "bootstrap" | "system" | "user" | null;
  geometry?: GeoJSONPolygon | null;
  centroid_lat?: number | null;
  centroid_lng?: number | null;
  min_lat?: number | null;
  max_lat?: number | null;
  min_lng?: number | null;
  max_lng?: number | null;
};

type UpdateZonePayload = {
  name?: string;
};

type UpdateZoneGeometryPayload = {
  geometry?: GeoJSONPolygon | null;
  centroid_lat?: number | null;
  centroid_lng?: number | null;
  min_lat?: number | null;
  max_lat?: number | null;
  min_lng?: number | null;
  max_lng?: number | null;
};

type DeleteZoneResult = {
  deleted: boolean;
  zone_id: number;
};

type UpsertZoneTemplatePayload = {
  name: string;
  config_json: ZoneTemplateConfig;
};

type ZoneGeometryResponse =
  | GeoJSONPolygon
  | { geometry: GeoJSONPolygon | null }
  | null;

type ZoneDto = ZoneDefinition & {
  zone_version_id?: number;
};

const normalizeZoneDto = (zone: ZoneDto | null | undefined): ZoneDefinition | null => {
  if (!zone) {
    return null;
  }

  return {
    ...zone,
    version_id:
      typeof zone.version_id === "number"
        ? zone.version_id
        : typeof zone.zone_version_id === "number"
          ? zone.zone_version_id
          : undefined,
  };
};

const normalizeZoneListResult = (
  result: ApiResult<ZoneDto[]>,
): ApiResult<ZoneDefinition[]> => ({
  ...result,
  data: Array.isArray(result.data)
    ? result.data
        .map((zone) => normalizeZoneDto(zone))
        .filter((zone): zone is ZoneDefinition => zone != null)
    : [],
});

const normalizeZoneResult = (
  result: ApiResult<ZoneDto>,
): ApiResult<ZoneDefinition> => ({
  ...result,
  data: normalizeZoneDto(result.data) as ZoneDefinition,
});

export const zoneApi = {
  fetchZoneVersions: (): Promise<ApiResult<ZoneVersion[]>> =>
    apiClient.request<ZoneVersion[]>({
      path: "/zones/",
      method: "GET",
    }),

  createZoneVersion: (
    payload: CreateZoneVersionPayload,
  ): Promise<ApiResult<ZoneVersion>> =>
    apiClient.request<ZoneVersion>({
      path: "/zones/",
      method: "PUT",
      data: payload,
    }),

  ensureFirstZoneVersion: (
    payload: CreateZoneVersionPayload,
  ): Promise<ApiResult<ZoneVersion>> =>
    apiClient.request<ZoneVersion>({
      path: "/zones/ensure-first-version",
      method: "POST",
      data: payload,
    }),

  activateZoneVersion: (versionId: number): Promise<ApiResult<ZoneVersion>> =>
    apiClient.request<ZoneVersion>({
      path: `/zones/${versionId}/activate`,
      method: "PATCH",
    }),

  fetchZonesForVersion: (
    versionId: number,
  ): Promise<ApiResult<ZoneDefinition[]>> =>
    apiClient
      .request<ZoneDto[]>({
        path: `/zones/${versionId}/zones`,
        method: "GET",
      })
      .then(normalizeZoneListResult),

  createZone: (
    versionId: number,
    payload: CreateZonePayload,
  ): Promise<ApiResult<ZoneDefinition>> =>
    apiClient
      .request<ZoneDto>({
        path: `/zones/${versionId}/zones`,
        method: "PUT",
        data: payload,
      })
      .then(normalizeZoneResult),

  updateZoneName: (
    versionId: number,
    zoneId: number,
    payload: UpdateZonePayload,
  ): Promise<ApiResult<ZoneDefinition>> =>
    apiClient
      .request<ZoneDto>({
        path: `/zones/${versionId}/zones/${zoneId}`,
        method: "PATCH",
        data: payload,
      })
      .then(normalizeZoneResult),

  updateZoneGeometry: (
    versionId: number,
    zoneId: number,
    payload: UpdateZoneGeometryPayload,
  ): Promise<ApiResult<ZoneDefinition>> =>
    apiClient
      .request<ZoneDto>({
        path: `/zones/${versionId}/zones/${zoneId}/geometry`,
        method: "PATCH",
        data: payload,
      })
      .then(normalizeZoneResult),

  deleteZone: (
    versionId: number,
    zoneId: number,
  ): Promise<ApiResult<DeleteZoneResult>> =>
    apiClient.request<DeleteZoneResult>({
      path: `/zones/${versionId}/zones/${zoneId}`,
      method: "DELETE",
    }),

  fetchZoneTemplate: (
    versionId: number,
    zoneId: number,
  ): Promise<ApiResult<ZoneTemplate | null>> =>
    apiClient.request<ZoneTemplate | null>({
      path: `/zones/${versionId}/zones/${zoneId}/template`,
      method: "GET",
    }),

  upsertZoneTemplate: (
    versionId: number,
    zoneId: number,
    payload: UpsertZoneTemplatePayload,
  ): Promise<ApiResult<ZoneTemplate>> =>
    apiClient.request<ZoneTemplate>({
      path: `/zones/${versionId}/zones/${zoneId}/template`,
      method: "PUT",
      data: payload,
    }),

  fetchZoneGeometry: (
    versionId: number,
    zoneId: number,
  ): Promise<ApiResult<ZoneGeometryResponse>> =>
    apiClient.request<ZoneGeometryResponse>({
      path: `/zones/${versionId}/zones/${zoneId}/geometry`,
      method: "GET",
    }),

  // Backward-compat aliases used by current plan form integration.
  listZoneVersions: (): Promise<ApiResult<ZoneVersion[]>> =>
    zoneApi.fetchZoneVersions(),

  listZonesForVersion: (
    versionId: number,
  ): Promise<ApiResult<ZoneDefinition[]>> =>
    zoneApi.fetchZonesForVersion(versionId),
};
