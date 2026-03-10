import { useCallback, useRef } from 'react'

import { loadGoogleMaps } from '../api/loadGoogleMaps'
import type { address } from '@/types/address'

const getAddressComponent = (
  components: Array<{ long_name: string; types: string[] }> | undefined,
  types: string[],
): string | undefined => {
  const component = components?.find((item) => types.some((type) => item.types.includes(type)))
  return component?.long_name
}

export const useReverseGeocodeCall = () => {
  const geocoderRef = useRef<{
    geocode: (request: { location: { lat: number; lng: number } }) => Promise<{
      results?: Array<{
        formatted_address?: string
        address_components?: Array<{ long_name: string; types: string[] }>
      }>
    }>
  } | null>(null)

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<address> => {
    const googleMaps = (await loadGoogleMaps()) as any

    if (!geocoderRef.current) {
      geocoderRef.current = new googleMaps.maps.Geocoder()
    }
    const geocoder = geocoderRef.current
    if (!geocoder) {
      throw new Error('Reverse geocoder unavailable')
    }

    const result = await geocoder.geocode({
      location: { lat, lng },
    })

    const first = result.results?.[0]
    if (!first) {
      throw new Error('Reverse geocode failed')
    }

    return {
      street_address: first.formatted_address ?? '',
      city: getAddressComponent(first.address_components, [
        'locality',
        'administrative_area_level_2',
        'administrative_area_level_1',
      ]),
      postal_code: getAddressComponent(first.address_components, ['postal_code']),
      country: getAddressComponent(first.address_components, ['country']),
      coordinates: { lat, lng },
    }
  }, [])

  return {
    reverseGeocode,
  }
}
