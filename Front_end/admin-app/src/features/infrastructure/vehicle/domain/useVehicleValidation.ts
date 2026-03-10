import { validateString } from '@shared-domain'

export const useVehicleValidation = () => ({
  validateName: (value: string) => validateString(value),
})
