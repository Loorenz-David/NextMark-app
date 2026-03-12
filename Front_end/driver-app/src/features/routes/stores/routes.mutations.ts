import type { DriverRouteRecord } from '../domain'
import { useRoutesStore } from './routes.store'

export const setRoutes = (routes: { byClientId: Record<string, DriverRouteRecord>; allIds: string[] }) =>
  useRoutesStore.getState().insertMany(routes)

export const clearRoutes = () => useRoutesStore.getState().clear()
