import type {
  DriverOrderCommandDeltaCollectionDto,
} from '../domain/routeActionDeltas.types'
import type {
  DriverCaseChatCommandDelta,
  DriverOrderCaseCommandDelta,
} from '@/features/order-case'

export type CompleteOrderResponseDto = {
  orders: DriverOrderCommandDeltaCollectionDto
}

export type UndoTerminalOrderResponseDto = {
  orders: DriverOrderCommandDeltaCollectionDto
}

export type FailOrderResponseDto = {
  orders: DriverOrderCommandDeltaCollectionDto
  order_case: DriverOrderCaseCommandDelta
  case_chat: DriverCaseChatCommandDelta
}
