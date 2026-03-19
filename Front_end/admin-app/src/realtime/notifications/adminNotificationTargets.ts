import type { NotificationItem } from '@shared-realtime'
import type { PayloadBase } from '@/features/home/types/types'
import type { useOrderActions } from '@/features/order/actions/order.actions'
import type { useCaseOrderActions } from '@/features/orderCase/pages/order/order.actions'
import type { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'

type AdminNotificationOpenDependencies = {
  openLocalDeliveryWorkspace: (payload: PayloadBase) => void
  openOrderDetail: ReturnType<typeof useOrderActions>['openOrderDetail']
  openCaseDetails: ReturnType<typeof useCaseOrderActions>['openCaseDetails']
}

type AdminNotificationMatchDependencies = {
  isBaseOpen: boolean
  basePayload?: PayloadBase
  sectionEntries: ReturnType<typeof useStackActionEntries>
}

export const openAdminNotificationTarget = (
  notification: NotificationItem,
  dependencies: AdminNotificationOpenDependencies,
) => {
  const { target } = notification

  if (target.kind === 'order_detail' && typeof target.params.orderId === 'number') {
    dependencies.openOrderDetail(
      {
        serverId: target.params.orderId,
        mode: 'view',
        freshAfter: notification.occurred_at,
      },
      {
        pageClass: 'bg-[var(--color-muted)]/10',
        borderLeft: 'rgb(var(--color-light-blue-r),0.7)',
      },
    )
    return
  }

  if (
    (target.kind === 'order_case_detail' || target.kind === 'order_case_chat')
    && (typeof target.params.orderCaseId === 'number' || typeof target.params.orderCaseClientId === 'string')
  ) {
    dependencies.openCaseDetails({
      orderCaseClientId: target.params.orderCaseClientId,
      orderCaseId: target.params.orderCaseId,
      freshAfter: notification.occurred_at,
    })
    return
  }

  if (target.kind === 'local_delivery_workspace' && typeof target.params.planId === 'number') {
    dependencies.openLocalDeliveryWorkspace({
      ordersPlanType: 'local_delivery',
      planId: target.params.planId,
      freshAfter: notification.occurred_at,
    })
  }
}

export const matchesAdminNotificationTarget = (
  notification: NotificationItem,
  dependencies: AdminNotificationMatchDependencies,
) => {
  const { basePayload, isBaseOpen, sectionEntries } = dependencies
  const { target } = notification

  if (target.kind === 'order_detail') {
    return sectionEntries.some((entry) => {
      if (entry.isClosing || entry.key !== 'order.details') {
        return false
      }

      const payload = entry.payload as { serverId?: number } | undefined
      return payload?.serverId === target.params.orderId
    })
  }

  if (target.kind === 'order_case_detail' || target.kind === 'order_case_chat') {
    return sectionEntries.some((entry) => {
      if (entry.isClosing || entry.key !== 'orderCase.details') {
        return false
      }

      const payload = entry.payload as { orderCaseId?: number; orderCaseClientId?: string } | undefined
      return (
        (typeof target.params.orderCaseClientId === 'string'
          && payload?.orderCaseClientId === target.params.orderCaseClientId)
        || (typeof target.params.orderCaseId === 'number'
          && payload?.orderCaseId === target.params.orderCaseId)
      )
    })
  }

  if (target.kind === 'local_delivery_workspace') {
    return isBaseOpen
      && basePayload?.ordersPlanType === 'local_delivery'
      && basePayload.planId === target.params.planId
  }

  return false
}
