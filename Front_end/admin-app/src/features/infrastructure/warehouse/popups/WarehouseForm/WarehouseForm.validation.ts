import type { WarehouseFormState } from './WarehouseForm.types'
import type { WarehouseFormWarnings } from './WarehouseForm.warnings'

export const useWarehouseFormValidation = ({
  formState,
  warnings,
}: {
  formState: WarehouseFormState
  warnings: WarehouseFormWarnings
}) => {
  const validateForm = () => {
    const nameValid = warnings.nameWarning.validate(formState.name)
    const locationValid = warnings.locationWarning.validate(formState.property_location)
    return nameValid && locationValid
  }

  return { validateForm }
}
