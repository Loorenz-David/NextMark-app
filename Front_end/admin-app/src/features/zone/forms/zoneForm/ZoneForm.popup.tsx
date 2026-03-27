import { useEffect, useMemo, useState } from "react";

import { useMessageHandler } from "@shared-message-handler";

import { createZoneAction } from "@/features/zone/actions/createZone.action";
import { deleteZoneAction } from "@/features/zone/actions/deleteZone.action";
import { updateZoneAction } from "@/features/zone/actions/updateZone.action";
import {
  ZoneFormFeature,
  type ZoneFormFields,
} from "@/features/zone/forms/zoneForm/ZoneForm";
import { useEnsureZoneGeometry } from "@/features/zone/controllers/useEnsureZoneGeometry";
import { useEnsureZoneTemplate } from "@/features/zone/controllers/useEnsureZoneTemplate";
import {
  selectZoneByVersionAndId,
  useZoneStore,
} from "@/features/zone/store/zone.store";
import type { GeoJSONPolygon, ZoneTemplateConfig } from "@/features/zone/types";
import { DRAWING_SELECTION_CLEAR_EVENT } from "@/shared/map/domain/constants/drawingSelectionModes";
import {
  FeaturePopupBody,
  FeaturePopupHeader,
  FeaturePopupShell,
} from "@/shared/popups/featurePopup";
import type { StackComponentProps } from "@/shared/stack-manager/types";

export type ZoneFormPayload =
  | { mode: "create"; geometry: GeoJSONPolygon; versionId: number }
  | { mode: "edit"; zoneId: number; versionId: number };

const parseOptionalNumber = (value: string): number | null => {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toTemplateConfig = (
  fields: ZoneFormFields,
): ZoneTemplateConfig | null => {
  const templateConfig: ZoneTemplateConfig = {
    vehicle_type_id: parseOptionalNumber(fields.vehicle_type_id),
    default_service_time_seconds: parseOptionalNumber(
      fields.default_service_time_seconds,
    ),
    depot_id: parseOptionalNumber(fields.depot_id),
    max_stops: parseOptionalNumber(fields.max_stops),
  };

  const hasAnyValue = Object.values(templateConfig).some(
    (value) => value != null,
  );
  return hasAnyValue ? templateConfig : null;
};

export const ZoneFormPopup = ({
  payload,
  onClose,
}: StackComponentProps<ZoneFormPayload>) => {
  const { showMessage } = useMessageHandler();
  const upsertZone = useZoneStore((state) => state.upsertZone);
  const removeZoneOptimistic = useZoneStore(
    (state) => state.removeZoneOptimistic,
  );
  const removeZoneById = useZoneStore((state) => state.removeZoneById);
  const setDrawnGeometry = useZoneStore((state) => state.setDrawnGeometry);

  const zone = useZoneStore((state) =>
    payload?.mode === "edit"
      ? selectZoneByVersionAndId(state, payload.versionId, payload.zoneId)
      : null,
  );
  const { load: ensureZoneGeometry } = useEnsureZoneGeometry(
    payload?.mode === "edit" ? payload.versionId : null,
    payload?.mode === "edit" ? payload.zoneId : null,
  );
  const { load: ensureZoneTemplate } = useEnsureZoneTemplate(
    payload?.mode === "edit" ? payload.versionId : null,
    payload?.mode === "edit" ? payload.zoneId : null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const mode = payload?.mode ?? "create";

  useEffect(() => {
    if (payload?.mode !== "edit") {
      return;
    }

    void Promise.all([ensureZoneGeometry(), ensureZoneTemplate()]);
  }, [ensureZoneGeometry, ensureZoneTemplate, payload?.mode]);

  const initialValues = useMemo(() => {
    if (!zone) {
      return {};
    }

    const template = zone.template_full?.config_json;

    return {
      name: zone.name ?? "",
      vehicle_type_id:
        template?.vehicle_type_id != null
          ? String(template.vehicle_type_id)
          : "",
      default_service_time_seconds:
        template?.default_service_time_seconds != null
          ? String(template.default_service_time_seconds)
          : "",
      depot_id: template?.depot_id != null ? String(template.depot_id) : "",
      max_stops: template?.max_stops != null ? String(template.max_stops) : "",
    };
  }, [zone]);

  const handleCreate = async (fields: ZoneFormFields) => {
    if (payload?.mode !== "create") {
      return;
    }

    const name = fields.name.trim();
    if (!name) {
      showMessage({ status: 400, message: "Zone name is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const createdZone = await createZoneAction(
        {
          versionId: payload.versionId,
          name,
          geometry: payload.geometry,
          templateConfig: toTemplateConfig(fields),
        },
        {
          upsertZone,
          removeZoneOptimistic,
          showMessage,
        },
      );

      if (createdZone) {
        setDrawnGeometry(null);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent(DRAWING_SELECTION_CLEAR_EVENT));
        }

        onClose?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (fields: ZoneFormFields) => {
    if (payload?.mode !== "edit" || !zone || typeof zone.id !== "number") {
      showMessage({ status: 404, message: "Zone not found for editing." });
      return;
    }

    const name = fields.name.trim();
    if (!name) {
      showMessage({ status: 400, message: "Zone name is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const succeeded = await updateZoneAction(
        {
          versionId: payload.versionId,
          zone: zone as typeof zone & { id: number },
          name,
          templateConfig: toTemplateConfig(fields),
        },
        {
          upsertZone,
          showMessage,
        },
      );

      if (succeeded) {
        onClose?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (payload?.mode !== "edit" || !zone || typeof zone.id !== "number") {
      showMessage({ status: 404, message: "Zone not found for deletion." });
      return;
    }

    setIsDeleting(true);
    try {
      const succeeded = await deleteZoneAction(
        {
          versionId: payload.versionId,
          zone: zone as typeof zone & { id: number },
        },
        {
          upsertZone,
          removeZoneById,
          showMessage,
        },
      );

      if (succeeded) {
        onClose?.();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = (fields: ZoneFormFields) => {
    if (mode === "create") {
      void handleCreate(fields);
      return;
    }

    void handleUpdate(fields);
  };

  const title = mode === "create" ? "Create Zone" : "Edit Zone";
  const subtitle =
    mode === "create"
      ? "Create a new zone from the drawn geometry."
      : "Update zone name and template defaults.";

  return (
    <FeaturePopupShell
      onRequestClose={() => onClose?.()}
      size="mdNoHeight"
      variant="center"
    >
      <FeaturePopupHeader
        title={title}
        subtitle={subtitle}
        onClose={() => onClose?.()}
      />
      <FeaturePopupBody>
        <ZoneFormFeature
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          submitLabel={mode === "create" ? "Create Zone" : "Save Changes"}
          onCancel={() => onClose?.()}
          onSubmit={handleSubmit}
          onDelete={mode === "edit" ? () => void handleDelete() : undefined}
        />
      </FeaturePopupBody>
    </FeaturePopupShell>
  );
};
