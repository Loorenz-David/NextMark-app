import { Switch } from '@/shared/inputs/Switch'
import { InfoHover } from '@/shared/layout/InfoHover'

import { useLocalDeliveryEditForm } from '../LocalDeliveryEditForm.context'
import { LOCAL_DELIVERY_CREATE_VARIANT_INFO } from '../info/createVariant.info'

export const LocalDeliveryEditFormCreateVariantToggle = () => {
  const { formState, formSetters } = useLocalDeliveryEditForm()

  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white/80 p-4">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--color-text)]">Create variant on save</p>
          <InfoHover content={LOCAL_DELIVERY_CREATE_VARIANT_INFO} />
        </div>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Save changes as a new variant instead of overwriting the current one.
        </p>
      </div>
      <Switch
        value={formState.create_variant_on_save}
        onChange={formSetters.handleCreateVariantToggle}
        ariaLabel="Create variant on save"
      />
    </div>
  )
}
