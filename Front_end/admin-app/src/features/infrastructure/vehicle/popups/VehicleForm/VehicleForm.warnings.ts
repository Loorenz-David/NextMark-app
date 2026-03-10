import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'

import { useVehicleValidation } from '../../domain/useVehicleValidation'

export type VehicleFormWarnings = ReturnType<typeof useVehicleFormWarnings>

export const useVehicleFormWarnings = () => {
  const validation = useVehicleValidation()

  const nameWarning = useInputWarning('Name is required.', (value, setMessage) => {
    const isValid = validation.validateName(String(value ?? ''))
    if (!isValid) {
      setMessage('Name is required.')
    }
    return isValid
  })

  return { nameWarning }
}
