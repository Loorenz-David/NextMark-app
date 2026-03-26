import { useInputWarning } from '@/shared/inputs/useInputWarning.hook'
import { validateAddress } from '@/shared/data-validation/addressValidation'

export const useStorePickupWarnings = () => {
    const supervisorWarning = useInputWarning(
        'Supervisor must be selected from drop down',
        (value: number | null) => typeof value === 'number'
    )

    const pickupLocationWarning = useInputWarning(
        'Pickup location must be selected from drop down',
        validateAddress
    )

    return {
        supervisorWarning,
        pickupLocationWarning,
    }
}

export type StorePickupWarnings = ReturnType<typeof useStorePickupWarnings>