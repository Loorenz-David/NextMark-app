import { useCallback } from 'react'
import type { address } from '@/types/address'

import type { EnsureServiceReturn } from '@/shared/google-maps/hooks/usePlacesAPIServices'


import type {
  PlaceInstance,
  PlaceLocation,
  LatLngLiteralLike,
  LatLngLike,
} from '../../types'


type PropsUsePlacesCall = {
    ensureServices: ()=> Promise<EnsureServiceReturn>
}
export const usePlacesCall =  ({
    ensureServices,
}: PropsUsePlacesCall)=>{

    const getPlaceDetails = useCallback(
        async (placeId: string) => {
          const { placeCtor, placesService,  sessionToken } = await ensureServices()
    
          if (placeCtor) {
            const place = new placeCtor({ id: placeId })
            await place.fetchFields({
              fields: ['formattedAddress', 'addressComponents', 'location'],
            })
    
            const location = place.location
    
            if (!location) {
              throw new Error('Failed to fetch place details.')
            }
    
            return mapAddress(place, location)
          }
    
          if (!placesService) {
            throw new Error('Places service is unavailable in this environment.')
          }
    
          return new Promise<address>((resolve, reject) => {
            placesService.getDetails(
              {
                placeId,
                sessionToken: sessionToken ?? undefined,
                fields: ['formatted_address', 'geometry.location', 'address_components'],
              },
              (result, status) => {
                if (status !== 'OK' || !result?.geometry?.location) {
                  reject(new Error('Failed to fetch place details.'))
                  return
                }
    
                const getAddressComponent = (types: string[]) => {
                  return result.address_components?.find((component) => types.some((type) => component.types.includes(type)))
                    ?.long_name
                }
    
              const payload: address = {
                street_address: result.formatted_address ?? '',
                country: getAddressComponent(['country']),
                city: getAddressComponent(['locality', 'administrative_area_level_2', 'administrative_area_level_1']),
                postal_code: getAddressComponent(['postal_code']),
                coordinates: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
              }
    
                
                resolve(payload)
              },
            )
          })
        },
        [ensureServices],
      )
    
    return {
        getPlaceDetails
    }

}



function isLatLngLiteral(location: PlaceLocation): location is LatLngLiteralLike {
  return Boolean(location && typeof (location as LatLngLiteralLike).lat === 'number')
}

function isLatLng(location: PlaceLocation): location is LatLngLike {
  return Boolean(location && typeof (location as LatLngLike).lat === 'function')
}

function extractCoordinates(location: PlaceLocation) {
  if (!location) {
    return null
  }

  if (isLatLngLiteral(location)) {
    return { lat: location.lat, lng: location.lng }
  }

  if (isLatLng(location)) {
    return { lat: location.lat(), lng: location.lng() }
  }

  return null
}

function mapAddress(place: PlaceInstance, location: PlaceLocation): address {
    const coords = extractCoordinates(location)
    if (!coords) {
    throw new Error('Missing coordinates for place result.')
    }

    const getComponent = (types: string[]) => {
    const component = place.addressComponents?.find((item) => {
        if (!item.types?.length) return false
        return types.some((type) => item.types?.includes(type))
    })

    return component?.longText ?? component?.shortText
    }

    return {
    street_address: place.formattedAddress ?? '',
    country: getComponent(['country']),
    city: getComponent(['locality', 'administrative_area_level_2', 'administrative_area_level_1']),
    postal_code: getComponent(['postal_code']),
    coordinates: coords,
    }
}
