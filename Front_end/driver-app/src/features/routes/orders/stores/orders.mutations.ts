import type { DriverOrderRecord } from '../domain'
import { useOrdersStore } from './orders.store'

export const setOrders = (orders: { byClientId: Record<string, DriverOrderRecord>; allIds: string[] }) =>
  useOrdersStore.getState().insertMany(orders)

export const clearOrders = () => useOrdersStore.getState().clear()
