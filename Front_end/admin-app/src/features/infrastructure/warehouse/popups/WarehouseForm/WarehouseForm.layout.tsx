import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { AddressAutocomplete } from '@/shared/inputs/address-autocomplete/AddressAutocomplete'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useWarehouseForm } from './WarehouseForm.context'
import { useWarehouseFormConfig } from './useWarehouseFormConfig'
import { useWarehouseFormSetters } from './useWarehouseFormSetters'

export const WarehouseFormLayout = () => {
  const { payload, formState, warnings, setFormState, handleSave, initialFormRef } = useWarehouseForm()
  const setters = useWarehouseFormSetters({ setFormState, warnings })

  useWarehouseFormConfig({ formState, initialFormRef, payload })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: payload.mode === 'create' ? 'Create' : 'Save', action: handleSave },
    }),
    [handleSave, payload.mode],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden pb-[40px] px-2 scroll-thin">
        <Field label="Name:" required={true}>
          <InputField
            value={formState.name}
            onChange={(event) => setters.handleName(event.target.value)}
            warningController={warnings.nameWarning}
          />
        </Field>
        {warnings.nameWarning.warning.isVisible ? (
          <InputWarning {...warnings.nameWarning.warning} />
        ) : null}

        <Field label="Property location:">
          <AddressAutocomplete
            onSelectedAddress={setters.handleLocation}
            selectedAddress={formState.property_location}
          />
        </Field>
        {warnings.locationWarning.warning.isVisible ? (
          <InputWarning {...warnings.locationWarning.warning} />
        ) : null}
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
