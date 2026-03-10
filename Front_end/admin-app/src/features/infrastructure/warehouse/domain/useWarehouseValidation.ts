import { validateString } from '@/shared/data-validation/stringValidation'
import { validateAddress } from '@/shared/data-validation/addressValidation'
import type { address } from '@/types/address'

export const useWarehouseValidation = () => ({
  validateName: (value: string) => validateString(value),
  validateLocation: (value: Record<string, unknown> | null | undefined) =>
    value ? validateAddress(value as address) : true,
})
