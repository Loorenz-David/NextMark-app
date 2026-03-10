import type { InternationalShippingWarnings } from './InternationalShipping.warnings'
import type { InternationalShippingPlanInput } from '@/features/plan/types/internationalShippingPlan'


type PropsValidation = {
    internationalShippingWarnings: InternationalShippingWarnings
    formState: InternationalShippingPlanInput
}

export const internationalShippingValidation = ({
    internationalShippingWarnings,
    formState,
}: PropsValidation) => {
    const validators = [
        internationalShippingWarnings.carrierNameWarning.validate(formState.carrier_name ?? ''),
    ]

    return validators.every( v => v === true)
}
 
