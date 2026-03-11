import { routeExecutionApi } from '@/app/services/routeExecution.api'
import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  DriverRouteActionResult,
} from '@/app/contracts/routeExecution.types'

export async function submitRouteActionAction(
  envelope: DriverCommandEnvelope<DriverRouteActionCommand>,
): Promise<DriverRouteActionResult | undefined> {
  const response = await routeExecutionApi.executeRouteAction(envelope)
  return response.data
}
