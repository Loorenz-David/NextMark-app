import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { reactiveOrderVisibility } from '../domain/orderReactiveVisibility'
import type { Order, OrderMap } from '../types/order'
import { useOrderQuery } from './orderQuery.store'
import {
  selectAllOrders,
  selectOrderByClientId,
  selectOrdersByCostumerId,
  selectOrderByServerId,
  selectOrdersByPlanId,
  setOrder,
  setOrders,
  updateOrderByClientId,
  upsertOrders,
  useOrderStore,
} from './order.store'

export const useOrders = () => useOrderStore(useShallow(selectAllOrders))

export const useVisibleOrders = () => {
  const visibleIds = useOrderStore((state) => state.visibleIds)
  const byClientId = useOrderStore((state) => state.byClientId)
  const query = useOrderQuery()

  return useMemo(() => {
    if (!visibleIds) return []

    return visibleIds
      .map((id) => byClientId[id])
      .filter(
        (order): order is Order => !!order && reactiveOrderVisibility(order, query.filters),
      )
  }, [visibleIds, byClientId, query])
}

export const useOrderByClientId = (clientId: string | null | undefined) =>
  useOrderStore(selectOrderByClientId(clientId))

export const useOrderByServerId = (id: number | null | undefined) =>
  useOrderStore(selectOrderByServerId(id))

export const useOrdersByPlanId = (planId: number | null | undefined) =>
  useOrderStore(useShallow(selectOrdersByPlanId(planId)))

export const useOrdersByCostumerServerId = (costumerId: number | null | undefined) =>
  useOrderStore(useShallow(selectOrdersByCostumerId(costumerId)))

export const useSetOrderStore = () =>
  useCallback((order: Order) => {
    setOrder(order)
  }, [])

export const useSetOrdersStore = () =>
  useCallback((table: OrderMap) => {
    setOrders(table)
  }, [])

export const useUpdateOrderStore = () =>
  useCallback(
    (clientId: string, updater: (order: Order) => Order) => {
      updateOrderByClientId(clientId, updater)
    },
    [],
  )

export const useUpsertOrdersStore = () =>
  useCallback((order: OrderMap) => {
    upsertOrders(order)
  }, [])
