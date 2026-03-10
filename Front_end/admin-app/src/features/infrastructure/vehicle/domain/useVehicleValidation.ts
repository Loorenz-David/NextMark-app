import { validateString } from '@/shared/data-validation/stringValidation'

export const useVehicleValidation = () => ({
  validateName: (value: string) => validateString(value),
})
