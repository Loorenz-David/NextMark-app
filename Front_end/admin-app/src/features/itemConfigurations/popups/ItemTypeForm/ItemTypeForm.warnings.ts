import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@/shared/data-validation/stringValidation'

export type ItemTypeFormWarnings = ReturnType<typeof useItemTypeFormWarnings>

export const useItemTypeFormWarnings = () => ({
  nameWarning: useInputWarning('Name is required.', (value) => validateString(String(value ?? ''))),
})
