import type { StorePickupWarnings } from './StorePickup.warnings'
import type { StorePickupPlan } from '@/features/plan/types/storePickupPlan'

type PropsValidation = {
    storePickupWarnings: StorePickupWarnings
    formState: StorePickupPlan
}

export const storePickupValidation = ({
    storePickupWarnings,
    formState
}: PropsValidation) => {
    
    const validators = [
        storePickupWarnings.pickupLocationWarning.validate(formState.pickup_location)
    ]

    return validators.every( v => v === true)
}
 
