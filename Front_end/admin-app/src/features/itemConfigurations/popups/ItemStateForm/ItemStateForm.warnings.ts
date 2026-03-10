import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@/shared/data-validation/stringValidation'

export type ItemStateFormWarnings = ReturnType<typeof useItemStateFormWarnings>

export const useItemStateFormWarnings = () => ({
  nameWarning: useInputWarning('Name is required.', (value) => validateString(String(value ?? ''))),
})
