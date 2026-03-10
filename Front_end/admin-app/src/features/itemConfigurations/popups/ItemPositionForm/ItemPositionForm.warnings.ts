import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@/shared/data-validation/stringValidation'

export type ItemPositionFormWarnings = ReturnType<typeof useItemPositionFormWarnings>

export const useItemPositionFormWarnings = () => ({
  nameWarning: useInputWarning('Name is required.', (value) => validateString(String(value ?? ''))),
})
