import { useCallback, useEffect, useRef, useState } from 'react'

import { loadGoogleMaps } from '../api/loadGoogleMaps'
import type {
  AutocompletePrediction,
  AutocompleteService,
  AutocompleteSessionToken,
  ComponentRestrictions,
  GoogleMapsPlacesLibrary,
  PlacesLibraryImport,
  PlaceConstructor,
  PlaceInstance,
  PlaceLocation,
  LatLngLiteralLike,
  LatLngLike,
  PlacesService,
  PlacesServiceStatus,
  PlaceSuggestion,
  AddressPayload,
} from '../types'





export interface UsePlacesAutocompleteOptions {
  debounceMs?: number
  componentRestrictions?: ComponentRestrictions
}

interface PredictionsState {
  suggestions: PlaceSuggestion[]
  status: PlacesServiceStatus | 'idle'
  error?: string
  isLoading: boolean
}

export type { PlaceSuggestion }

const initialPredictionState: PredictionsState = {
  suggestions: [],
  status: 'idle',
  isLoading: false,
}

export function usePlacesAutocomplete(options?: UsePlacesAutocompleteOptions) {
  const { debounceMs = 250, componentRestrictions } = options ?? {}
  const [query, setQuery] = useState('')
  const [predictions, setPredictions] = useState<PredictionsState>(initialPredictionState)

  const autocompleteServiceRef = useRef<AutocompleteService | null>(null)
  const placesServiceRef = useRef<PlacesService | null>(null)
  const placeCtorRef = useRef<PlaceConstructor | null>(null)
  const sessionTokenRef = useRef<AutocompleteSessionToken | null>(null)
  const placesLibraryRef = useRef<GoogleMapsPlacesLibrary | PlacesLibraryImport | null>(null)
  const debounceTimeoutRef = useRef<number | null>(null)

  const ensureServices = useCallback(async () => {
    const googleMaps = await loadGoogleMaps()

    if (!placesLibraryRef.current) {
      if (googleMaps.maps.importLibrary) {
        placesLibraryRef.current = await googleMaps.maps.importLibrary('places')
      } else {
        placesLibraryRef.current = googleMaps.maps.places
      }
    }

    const library = placesLibraryRef.current

    if (!library) {
      return {
        autocompleteService: null,
        placeCtor: null,
        placesService: null,
        library,
      }
    }

    if (!autocompleteServiceRef.current && library?.AutocompleteService) {
      autocompleteServiceRef.current = new library.AutocompleteService()
    }

    if (!sessionTokenRef.current && library?.AutocompleteSessionToken) {
      sessionTokenRef.current = new library.AutocompleteSessionToken()
    }

    if (!placeCtorRef.current && library && 'Place' in library && library.Place) {
      placeCtorRef.current = library.Place
    }

    if (!placeCtorRef.current && !placesServiceRef.current && library?.PlacesService) {
      placesServiceRef.current = new library.PlacesService(document.createElement('div'))
    }

    return {
      autocompleteService: autocompleteServiceRef.current,
      placeCtor: placeCtorRef.current,
      placesService: placesServiceRef.current,
      library,
    }
  }, [])

  const resetPredictions = useCallback(() => {
    setPredictions(initialPredictionState)
  }, [])

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        resetPredictions()
        return
      }

      setPredictions((prev) => ({ ...prev, isLoading: true }))

      try {
        const { autocompleteService } = await ensureServices()
        if (!autocompleteService) {
          resetPredictions()
          return
        }

        autocompleteService.getPlacePredictions(
          {
            input,
            sessionToken: sessionTokenRef.current ?? undefined,
            componentRestrictions,
          },
          (suggestions, status) => {
            if (status !== 'OK' || !suggestions) {
              setPredictions({
                suggestions: [],
                status,
                isLoading: false,
                error: status === 'ZERO_RESULTS' ? undefined : status,
              })
              return
            }

            const mapped = suggestions.map((suggestion) => mapSuggestion(suggestion))

            setPredictions({
              suggestions: mapped,
              status,
              isLoading: false,
            })
          },
        )
      } catch (error) {
        setPredictions({
          suggestions: [],
          status: 'UNKNOWN_ERROR',
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    [componentRestrictions, ensureServices, resetPredictions],
  )

  useEffect(() => {
    if (!query) {
      resetPredictions()
      return
    }

    if (debounceTimeoutRef.current !== null) {
      window.clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      fetchPredictions(query)
    }, debounceMs)

    return () => {
      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [debounceMs, fetchPredictions, query, resetPredictions])

  const getPlaceDetails = useCallback(
    async (placeId: string) => {
      const { placeCtor, placesService, library } = await ensureServices()

      if (placeCtor) {
        const place = new placeCtor({ id: placeId })
        await place.fetchFields({
          fields: ['formattedAddress', 'addressComponents', 'location'],
        })

        const location = place.location

        if (!location) {
          throw new Error('Failed to fetch place details.')
        }

        if (library?.AutocompleteSessionToken) {
          sessionTokenRef.current = new library.AutocompleteSessionToken()
        }

        return mapPlaceInstanceToClientAddress(place, location)
      }

      if (!placesService) {
        throw new Error('Places service is unavailable in this environment.')
      }

      return new Promise<AddressPayload>((resolve, reject) => {
        placesService.getDetails(
          {
            placeId,
            sessionToken: sessionTokenRef.current ?? undefined,
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

          const payload: AddressPayload = {
            raw_address: result.formatted_address ?? '',
            country: getAddressComponent(['country']),
            city: getAddressComponent(['locality', 'administrative_area_level_2', 'administrative_area_level_1']),
            postal_code: getAddressComponent(['postal_code']),
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
          }

            if (library?.AutocompleteSessionToken) {
              sessionTokenRef.current = new library.AutocompleteSessionToken()
            }
            resolve(payload)
          },
        )
      })
    },
    [ensureServices],
  )

  return {
    query,
    setQuery,
    predictions,
    resetPredictions,
    getPlaceDetails,
  }
}

function mapSuggestion(suggestion: AutocompletePrediction): PlaceSuggestion {
  return {
    description: suggestion.description,
    placeId: suggestion.place_id,
    mainText: suggestion.structured_formatting?.main_text,
    secondaryText: suggestion.structured_formatting?.secondary_text,
  }
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

function mapPlaceInstanceToClientAddress(place: PlaceInstance, location: PlaceLocation): AddressPayload {
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
    raw_address: place.formattedAddress ?? '',
    country: getComponent(['country']),
    city: getComponent(['locality', 'administrative_area_level_2', 'administrative_area_level_1']),
    postal_code: getComponent(['postal_code']),
    coordinates: coords,
  }
}

function isLatLngLiteral(location: PlaceLocation): location is LatLngLiteralLike {
  return Boolean(location && typeof (location as LatLngLiteralLike).lat === 'number')
}

function isLatLng(location: PlaceLocation): location is LatLngLike {
  return Boolean(location && typeof (location as LatLngLike).lat === 'function')
}
