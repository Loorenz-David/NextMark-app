import { useEffect, useRef } from 'react'

import {
  useOrderSelectionActions,
  useOrderSelectionMode,
} from '@/features/order/store/orderSelectionHooks.store'
import {
  useLocalDeliverySelectionActions,
  useLocalDeliverySelectionMode,
} from '@/features/plan/planTypes/localDelivery/store/localDeliverySelectionHooks.store'

type SelectionConflictDecision = 'none' | 'disable_order' | 'disable_local_delivery'

export const resolveSelectionConflict = (params: {
  isOrderMode: boolean
  wasOrderMode: boolean
  isLocalDeliveryMode: boolean
  wasLocalDeliveryMode: boolean
}): SelectionConflictDecision => {
  const { isOrderMode, wasOrderMode, isLocalDeliveryMode, wasLocalDeliveryMode } = params

  if (!isOrderMode || !isLocalDeliveryMode) {
    return 'none'
  }

  const orderActivatedNow = isOrderMode && !wasOrderMode
  const localActivatedNow = isLocalDeliveryMode && !wasLocalDeliveryMode

  if (localActivatedNow && !orderActivatedNow) {
    return 'disable_order'
  }

  return 'disable_local_delivery'
}

export const useMapSelectionModeGuardFlow = () => {
  const isOrderMode = useOrderSelectionMode()
  const isLocalDeliveryMode = useLocalDeliverySelectionMode()
  const { disableSelectionMode: disableOrderSelectionMode } = useOrderSelectionActions()
  const { disableSelectionMode: disableLocalDeliverySelectionMode } = useLocalDeliverySelectionActions()
  const previousModesRef = useRef({
    isOrderMode: false,
    isLocalDeliveryMode: false,
  })

  useEffect(() => {
    const decision = resolveSelectionConflict({
      isOrderMode,
      wasOrderMode: previousModesRef.current.isOrderMode,
      isLocalDeliveryMode,
      wasLocalDeliveryMode: previousModesRef.current.isLocalDeliveryMode,
    })

    if (decision === 'disable_order') {
      disableOrderSelectionMode()
    } else if (decision === 'disable_local_delivery') {
      disableLocalDeliverySelectionMode()
    }

    previousModesRef.current = {
      isOrderMode,
      isLocalDeliveryMode,
    }
  }, [
    disableLocalDeliverySelectionMode,
    disableOrderSelectionMode,
    isLocalDeliveryMode,
    isOrderMode,
  ])
}

