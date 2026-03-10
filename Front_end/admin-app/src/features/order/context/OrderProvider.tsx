import type { PropsWithChildren, RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import {  useVisibleOrders } from '../store/orderHooks.store'
import { OrderContextProvider } from './OrderContext'
import { useOrderActions } from '../actions/order.actions'
import {   useOrderQuery } from "../store/orderQuery.store";
import { useOrderSelectionListActions } from '../actions/orderSelection.actions'
import { useBaseControlls, useMapManager, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useOrderCircleSelectionFlow } from '../flows/orderCircleSelection.flow'
import { useOrderBatchSelectionResolveFlow } from '../flows/orderBatchSelectionResolve.flow'
import { useOrderStats } from '../store/orderList.store'
import {
  useHoveredOrderClientId,
  useOrderMapInteractionActions,
  useOrderMarkerLookup,
} from '../store/orderMapInteractionHooks.store'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import type { Order } from '../types/order'
import { useOrderSelectionActions, useOrderSelectionMode } from '../store/orderSelectionHooks.store'
import { useOrderSelectionStore } from '../store/orderSelection.store'
import { useAuthSession } from '@/features/auth/login/hooks/useAuthSelectors'
import { useOrderGroupUIStore } from '../store/orderGroupUI.store'
import { useOrderPaginationController } from '../hooks/useOrderPaginationController'
import { useOrderMapDataFlow } from '../flows/orderMapData.flow'

type OrderProviderProps = PropsWithChildren<{
  scrollContainerRef?: RefObject<HTMLElement | null>
}>

export const OrderProvider = ({ children, scrollContainerRef }: OrderProviderProps) => {
  const orders = useVisibleOrders()
  const orderStats = useOrderStats()
  const orderActions = useOrderActions()
  const isSelectionMode = useOrderSelectionMode()
  const { disableSelectionMode } = useOrderSelectionActions()
  const baseControlls = useBaseControlls()
  const query = useOrderQuery()
  const session = useAuthSession()
  const previousTeamIdRef = useRef<number | null>(null)
  const mapManager = useMapManager()
  const sectionManager = useSectionManager()
  const sectionEntries = useStackActionEntries(sectionManager)
  const hoveredClientId = useHoveredOrderClientId()
  const markerLookup = useOrderMarkerLookup()
  const { setHovered, clearHovered, openGroupOverlay, closeGroupOverlay } = useOrderMapInteractionActions()
  const handleScrollToTop = useCallback(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [scrollContainerRef])

  const orderSelectionActions = useOrderSelectionListActions({
    query,
    orderStats,
    visibleOrders: orders,
  })
  const {
    currentPage,
    hasMore,
    isLoadingPage,
    loadFirstPage,
    loadNextPage,
  } = useOrderPaginationController({
    query,
    scrollToTop: handleScrollToTop,
  })

  useOrderBatchSelectionResolveFlow()

  const activeOrderDetailClientId = useMemo(() => {
    const openOrderDetails = sectionEntries.filter(
      (entry) => !entry.isClosing && entry.key === 'order.details',
    )
    const latest = openOrderDetails.at(-1)
    const payload = latest?.payload as { clientId?: string } | undefined
    return payload?.clientId ?? null
  }, [sectionEntries])

  const handleOrderRowMouseEnter = useCallback(
    (order: Order) => {
      setHovered(order.client_id, 'list')
    },
    [setHovered],
  )

  const handleOrderRowMouseLeave = useCallback(() => {
    clearHovered('list')
  }, [clearHovered])

  const handleOrderMarkerMouseEnter = useCallback(
    (_event: MouseEvent, order: Order) => {
      setHovered(order.client_id, 'map')
    },
    [setHovered],
  )

  const handleOrderMarkerMouseLeave = useCallback((_event: MouseEvent, _order: Order) => {
    clearHovered('map')
  }, [clearHovered])

  const handleGroupMarkerClick = useCallback(
    ({ markerId, markerAnchorEl, orders: groupedOrders }: {
      markerId: string
      markerAnchorEl: HTMLElement
      orders: Order[]
    }) => {
      openGroupOverlay({
        markerId,
        markerAnchorEl,
        orderClientIds: groupedOrders.map((order) => order.client_id),
      })
    },
    [openGroupOverlay],
  )
  

  useOrderMapDataFlow({
    query,
    bootstrapOrders: orders,
    onMarkerClick: orderActions.handleOrderMarkerClick,
    onGroupMarkerClick: handleGroupMarkerClick,
    onMarkerMouseEnter: handleOrderMarkerMouseEnter,
    onMarkerMouseLeave: handleOrderMarkerMouseLeave,
    markerClassName: 'order-marker',
    visible: !baseControlls.isBaseOpen,
    refreshEnabled: activeOrderDetailClientId == null,
  })
  useOrderCircleSelectionFlow()

  useEffect(() => {
    const markerId = activeOrderDetailClientId
      ? markerLookup.markerIdByOrderClientId[activeOrderDetailClientId] ?? activeOrderDetailClientId
      : null
    mapManager.setSelectedMarker(markerId)
  }, [activeOrderDetailClientId, mapManager, markerLookup.markerIdByOrderClientId])

  useEffect(() => {
    const markerId = hoveredClientId
      ? markerLookup.markerIdByOrderClientId[hoveredClientId] ?? hoveredClientId
      : null
    mapManager.setHoveredMarker(markerId)
  }, [hoveredClientId, mapManager, markerLookup.markerIdByOrderClientId])

  useEffect(() => {
    void loadFirstPage()
  }, [loadFirstPage])

  useEffect(() => {
    return () => {
      useOrderSelectionStore.getState().disableSelectionMode()
      useOrderGroupUIStore.getState().clearGroupUI()
      closeGroupOverlay()
    }
  }, [closeGroupOverlay])

  useEffect(() => {
    if (baseControlls.isBaseOpen) {
      closeGroupOverlay()
    }
  }, [baseControlls.isBaseOpen, closeGroupOverlay])

  useEffect(() => {
    const teamIdRaw = (
      session?.identity?.team_id
      ?? session?.user?.teamId
      ?? null
    )
    const teamId = Number.isFinite(Number(teamIdRaw)) ? Number(teamIdRaw) : null

    if (previousTeamIdRef.current == null) {
      previousTeamIdRef.current = teamId
      return
    }

    if (teamId != null && previousTeamIdRef.current !== teamId) {
      disableSelectionMode()
    }

    previousTeamIdRef.current = teamId
  }, [disableSelectionMode, session?.identity, session?.user?.teamId])

  const isOrderSelected = useCallback((order: Order) => {
    const state = useOrderSelectionStore.getState()
    if (typeof order.id === 'number') {
      if (state.excludedServerIds.includes(order.id)) {
        return false
      }
      return state.manualSelectedServerIds.includes(order.id)
        || state.loadedSelectionIds.includes(order.id)
    }
    return state.manualSelectedClientIds.includes(order.client_id)
  }, [])



  const value = useMemo(
    () => ({
      orders,
      orderActions,
      orderSelectionActions,
      isSelectionMode,
      isOrderSelected,
      query,
      orderStats,
      hoveredClientId,
      handleOrderRowMouseEnter,
      handleOrderRowMouseLeave,
      currentPage,
      hasMorePages: hasMore,
      isLoadingNextPage: isLoadingPage,
      loadNextPage,
    }),
    [
      currentPage,
      handleOrderRowMouseEnter,
      handleOrderRowMouseLeave,
      hasMore,
      hoveredClientId,
      isOrderSelected,
      isSelectionMode,
      isLoadingPage,
      loadNextPage,
      orderActions,
      orderSelectionActions,
      orderStats,
      orders,
      query,
    ],
  )

  return <OrderContextProvider value={value}>{children}</OrderContextProvider>
}
