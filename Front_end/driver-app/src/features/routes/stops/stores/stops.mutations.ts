import type { DriverRouteStopRecord } from '../domain'
import { useStopsStore } from './stops.store'

export const setStops = (stops: { byClientId: Record<string, DriverRouteStopRecord>; allIds: string[] }) =>
  useStopsStore.getState().insertMany(stops)

export const clearStops = () => useStopsStore.getState().clear()
