import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateString } from '@/shared/data-validation/stringValidation'

export const useInternationalShippingWarnings = () => {
    const carrierNameWarning = useInputWarning(
        'Carrier name is required',
        (value: string) => validateString(value)
    )

    return {
        carrierNameWarning,
    }
}

export type InternationalShippingWarnings = ReturnType< typeof useInternationalShippingWarnings>