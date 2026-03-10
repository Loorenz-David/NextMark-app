import { useState, useCallback } from 'react'
import type { EnsureServiceReturn } from '@/shared/google-maps/hooks/usePlacesAPIServices'

import type {
  AutocompletePrediction,
  ComponentRestrictions,
  PlacesServiceStatus,
} from '@/shared/google-maps/types'
import type { PlaceSuggestion } from '../types'

type PredictionsState = {
  suggestions: PlaceSuggestion[]
  status: PlacesServiceStatus | 'idle'
  error?: string
  isLoading: boolean
}




const initialPredictionState: PredictionsState = {
  suggestions: [],
  status: 'idle',
  isLoading: false,
}

type PropsUsePredictionCall = {
    componentRestrictions?: ComponentRestrictions
    ensureServices: ()=> Promise<EnsureServiceReturn>
}

export const usePredictionCall = ({
    componentRestrictions,
    ensureServices
}:PropsUsePredictionCall)=>{

    const [ predictions, setPredictions ] = useState<PredictionsState>(initialPredictionState)


    const resetPredictions = useCallback(() => {
        setPredictions(initialPredictionState)
      }, [])

    function mapSuggestion(suggestion: AutocompletePrediction): PlaceSuggestion {
        return {
            type: 'place',
            description: suggestion.description,
            placeId: suggestion.place_id,
            mainText: suggestion.structured_formatting?.main_text,
            secondaryText: suggestion.structured_formatting?.secondary_text,
        }
    }

    const fetchPredictions = useCallback(
        async (input: string) => {

          if (!input.trim()) {
            resetPredictions()
            return
          }
    
          setPredictions((prev) => ({ ...prev, isLoading: true }))
    
          try {
            const { autocompleteService, sessionToken } = await ensureServices()
            if (!autocompleteService) {
              resetPredictions()
              return
            }
    
            autocompleteService.getPlacePredictions(
              {
                input,
                sessionToken: sessionToken ?? undefined,
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
      
    return {
        resetPredictions,
        fetchPredictions,
        predictions
    }
}
