import type { ZoneState } from '@/features/zone/types'

import {
  getInitialZoneTemplateFormFields,
  type ZoneTemplateFormFields,
} from './zoneTemplateForm.domain'

export type ZoneFormState = {
  name: string
} & ZoneTemplateFormFields

export const buildInitialZoneFormState = (
  zone: ZoneState | null | undefined,
): ZoneFormState => ({
  name: zone?.name ?? '',
  ...getInitialZoneTemplateFormFields(zone?.template_full),
})
