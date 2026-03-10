import { useRef, useCallback } from 'react'
import { loadGoogleMaps } from '../api/loadGoogleMaps'
import type {
  AutocompleteService,
  AutocompleteSessionToken,
  GoogleMapsPlacesLibrary,
  PlacesLibraryImport,
  PlaceConstructor,
  PlacesService,
} from '../types'

export type  EnsureServiceReturn = {
    sessionToken: AutocompleteSessionToken | null;
    autocompleteService: AutocompleteService | null;
    placeCtor: PlaceConstructor | null;
    placesService: PlacesService | null;
    library: GoogleMapsPlacesLibrary | null;
}

export const usePlacesAPIServices = ()=>{
    const autocompleteServiceRef = useRef<AutocompleteService | null>(null)
    const placesServiceRef = useRef<PlacesService | null>(null)
    const placeCtorRef = useRef<PlaceConstructor | null>(null)
    const sessionTokenRef = useRef<AutocompleteSessionToken | null>(null)
    const placesLibraryRef = useRef<GoogleMapsPlacesLibrary | PlacesLibraryImport | null>(null)

    const ensureServices = useCallback(
        async (): Promise<EnsureServiceReturn> => {
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
                sessionToken:null,
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
                sessionToken: sessionTokenRef.current,
                autocompleteService: autocompleteServiceRef.current,
                placeCtor: placeCtorRef.current,
                placesService: placesServiceRef.current,
                library,
            }
    }, [])

    return {
        ensureServices
    }
}

