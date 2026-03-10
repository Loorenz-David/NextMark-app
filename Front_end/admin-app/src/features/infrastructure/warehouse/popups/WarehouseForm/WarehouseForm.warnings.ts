import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import type { address } from '@/types/address'

import { useWarehouseValidation } from '../../domain/useWarehouseValidation'

export type WarehouseFormWarnings = ReturnType<typeof useWarehouseFormWarnings>

export const useWarehouseFormWarnings = () => {
  const validation = useWarehouseValidation()

  const nameWarning = useInputWarning('Name is required.', (value, setMessage) => {
    const isValid = validation.validateName(String(value ?? ''))
    if (!isValid) {
      setMessage('Name is required.')
    }
    return isValid
  })

  const locationWarning = useInputWarning('Please provide a valid address.', (value, setMessage) => {
    const isValid = validation.validateLocation(value as address | null)
    if (!isValid) {
      setMessage('Please provide a valid address.')
    }
    return isValid
  })

  return {
    nameWarning,
    locationWarning,
  }
}
