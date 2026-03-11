import type {
  DriverCommandEnvelope,
  DriverRouteActionCommand,
  DriverRouteActionResult,
  SyncExecutionState,
} from '@/app/contracts/routeExecution.types'
import type { DriverWorkspaceContext } from '@/app/contracts/driverSession.types'
import { submitRouteActionAction } from '../actions/submitRouteAction.action'
import {
  applyRouteActionResult,
  setRouteActionFailure,
  setRouteActionSubmitting,
} from '../stores/routeExecution.mutations'
import type { RouteExecutionStore } from '../stores/routeExecution.store'

type SubmitRouteActionDependencies = {
  workspace: DriverWorkspaceContext | null
  store: RouteExecutionStore
  command: DriverRouteActionCommand
}

export async function submitRouteActionFlow({
  workspace,
  store,
  command,
}: SubmitRouteActionDependencies): Promise<DriverRouteActionResult> {
  if (!workspace) {
    return {
      syncState: 'terminal_failure',
      message: 'No active workspace.',
    }
  }

  const envelope: DriverCommandEnvelope<DriverRouteActionCommand> = {
    clientCommandId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
    workspaceScopeKey: workspace.workspaceScopeKey,
    issuedAt: new Date().toISOString(),
    command,
  }

  setRouteActionSubmitting(store, envelope)

  try {
    const result = await submitRouteActionAction(envelope)
    const nextResult = result ?? {
      syncState: 'synced' as SyncExecutionState,
      route: null,
    }

    applyRouteActionResult(store, envelope, nextResult)
    return nextResult
  } catch (error) {
    console.error('Failed to submit route action', error)

    const failure: DriverRouteActionResult = {
      syncState: 'retryable_failure',
      message: 'Unable to send route action.',
    }

    setRouteActionFailure(store, envelope, failure.message ?? 'Unable to send route action.')
    return failure
  }
}
