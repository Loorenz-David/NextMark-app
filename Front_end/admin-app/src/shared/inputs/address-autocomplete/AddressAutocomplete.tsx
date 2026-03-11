import { AddressAutocompleteProvider } from './AddressAutocomplete.provider'
import { AddressAutocompleteLayout } from './AddressAutocomplete.layout'
import type { CSSProperties } from 'react'
import type{ address } from '@/types/address'
import type { ComponentRestrictions } from '@shared-google-maps'

type PropsAddressAutocomplete = {
    onSelectedAddress: (value: address | null ) => void
    selectedAddress: address | null | undefined
    componentRestrictions?: ComponentRestrictions
    defaultToCurrentLocation?: boolean
    enableCurrentLocation?: boolean
    enableSavedLocations?: boolean
    intentKey?: string
    fieldClassName?: string
    inputClassName?: string
    containerClassName?:string
    inputStyle?: CSSProperties
    placeholder?: string
}
export const AddressAutocomplete = ({
    onSelectedAddress,
    selectedAddress,
    componentRestrictions,
    defaultToCurrentLocation = false,
    enableCurrentLocation = false,
    enableSavedLocations = false,
    intentKey,
    fieldClassName,
    inputClassName,
    containerClassName,
    inputStyle,
    placeholder = 'Search address...',
}:PropsAddressAutocomplete)=>{

    return(
        <AddressAutocompleteProvider
            onSelectedAddress={ onSelectedAddress }
            selectedAddress={ selectedAddress }
            componentRestrictions={componentRestrictions}
            defaultToCurrentLocation={defaultToCurrentLocation}
            enableCurrentLocation={enableCurrentLocation}
            enableSavedLocations={enableSavedLocations}
            intentKey={intentKey}
        >
            <AddressAutocompleteLayout
                fieldClassName={fieldClassName}
                inputClassName={inputClassName}
                containerClassName={containerClassName}
                inputStyle={inputStyle}
                placeholder={placeholder}
            />
        </AddressAutocompleteProvider>
    )
}
