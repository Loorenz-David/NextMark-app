import type { Dispatch, SetStateAction } from 'react'

import type { address } from '@/types/address'

import type { WarehouseFormState } from './WarehouseForm.types'
import type { WarehouseFormWarnings } from './WarehouseForm.warnings'

export const useWarehouseFormSetters = ({
  setFormState,
  warnings,
}: {
  setFormState: Dispatch<SetStateAction<WarehouseFormState>>
  warnings: WarehouseFormWarnings
}) => {
  const handleName = (value: string) => {
    warnings.nameWarning.validate(value)
    setFormState((prev) => ({ ...prev, name: value }))
  }

  const handleLocation = (value: address | null) => {
    warnings.locationWarning.validate(value)
    setFormState((prev) => ({ ...prev, property_location: value }))
  }

  return { handleName, handleLocation }
}
