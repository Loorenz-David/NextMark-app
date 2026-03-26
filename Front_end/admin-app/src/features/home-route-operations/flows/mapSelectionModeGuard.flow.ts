import { useEffect, useRef } from 'react'

import {
  useOrderSelectionActions,
  useOrderSelectionMode,
} from '@/features/order/store/orderSelectionHooks.store'
import {
  useRouteGroupSelectionActions,
  useRouteGroupSelectionMode,
} from '@/features/plan/routeGroup/store/routeGroupSelectionHooks.store'

type SelectionConflictDecision = 'none' | 'disable_order' | 'disable_local_delivery'

export const resolveSelectionConflict = (params: {
  isOrderMode: boolean
  wasOrderMode: boolean
  isRouteGroupMode: boolean
  wasRouteGroupMode: boolean
}): SelectionConflictDecision => {
  const { isOrderMode, wasOrderMode, isRouteGroupMode, wasRouteGroupMode } = params

  if (!isOrderMode || !isRouteGroupMode) {
    return 'none'
  }

  const orderActivatedNow = isOrderMode && !wasOrderMode
  const routeGroupActivatedNow = isRouteGroupMode && !wasRouteGroupMode

  if (routeGroupActivatedNow && !orderActivatedNow) {
    return 'disable_order'
  }

  return 'disable_local_delivery'
}

export const useMapSelectionModeGuardFlow = () => {
  const isOrderMode = useOrderSelectionMode()
  const isRouteGroupMode = useRouteGroupSelectionMode()
  const { disableSelectionMode: disableOrderSelectionMode } = useOrderSelectionActions()
  const { disableSelectionMode: disableRouteGroupSelectionMode } = useRouteGroupSelectionActions()
  const previousModesRef = useRef({
    isOrderMode: false,
    isRouteGroupMode: false,
  })

  useEffect(() => {
    const decision = resolveSelectionConflict({
      isOrderMode,
      wasOrderMode: previousModesRef.current.isOrderMode,
      isRouteGroupMode,
      wasRouteGroupMode: previousModesRef.current.isRouteGroupMode,
    })

    if (decision === 'disable_order') {
      disableOrderSelectionMode()
    } else if (decision === 'disable_local_delivery') {
      disableRouteGroupSelectionMode()
    }

    previousModesRef.current = {
      isOrderMode,
      isRouteGroupMode,
    }
  }, [
    disableRouteGroupSelectionMode,
    disableOrderSelectionMode,
    isRouteGroupMode,
    isOrderMode,
  ])
}
