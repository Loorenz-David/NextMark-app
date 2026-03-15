import { adjustRouteDatesToTodayApi } from '../api'

export async function adjustRouteDatesToTodayAction(routeId: number, timeZone: string) {
  const response = await adjustRouteDatesToTodayApi(routeId, { time_zone: timeZone })
  return response.data
}
