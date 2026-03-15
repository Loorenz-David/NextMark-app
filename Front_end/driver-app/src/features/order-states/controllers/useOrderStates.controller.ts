import { useMemo, useSyncExternalStore } from 'react'
import { useOrderStatesStore } from '../stores'
import { selectAllOrderStates } from '../stores/orderStates.store'

export const useOrderStates = () => {
  const state = useSyncExternalStore(
    useOrderStatesStore.subscribe,
    useOrderStatesStore.getState,
    useOrderStatesStore.getState,
  )

  return useMemo(() => selectAllOrderStates(state), [state])
}
