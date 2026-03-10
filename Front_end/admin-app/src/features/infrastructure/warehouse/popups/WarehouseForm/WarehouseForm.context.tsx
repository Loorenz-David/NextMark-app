import { createContext, useContext } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { WarehouseFormPayload, WarehouseFormState } from './WarehouseForm.types'
import type { WarehouseFormWarnings } from './WarehouseForm.warnings'

type WarehouseFormContextValue = {
  payload: WarehouseFormPayload
  formState: WarehouseFormState
  setFormState: Dispatch<SetStateAction<WarehouseFormState>>
  initialFormRef: RefObject<WarehouseFormState | null>
  warnings: WarehouseFormWarnings
  handleSave: () => void
}

const WarehouseFormContext = createContext<WarehouseFormContextValue | null>(null)

export const WarehouseFormContextProvider = WarehouseFormContext.Provider

export const useWarehouseForm = () => {
  const context = useContext(WarehouseFormContext)
  if (!context) {
    throw new Error('useWarehouseForm must be used within WarehouseFormProvider.')
  }
  return context
}
