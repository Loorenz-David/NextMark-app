import { useEffect } from 'react'
import { createNotificationsChannel } from '@shared-realtime'
import { adminRealtimeClient } from '@/realtime/client'
import { useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
} from './notification.store'

const notificationsChannel = createNotificationsChannel(adminRealtimeClient)

const collectActiveNotificationIds = (entries: ReturnType<typeof useStackActionEntries>) => {
  const notifications = getAdminNotificationSnapshot().items
  if (notifications.length === 0) {
    return []
  }

  return notifications
    .filter((notification) => {
      const target = notification.target
      if (target.kind === 'order_detail') {
        return entries.some((entry) => {
          if (entry.isClosing || entry.key !== 'order.details') {
            return false
          }
          const payload = entry.payload as { serverId?: number } | undefined
          return payload?.serverId === target.params.orderId
        })
      }

      if (target.kind === 'order_case_detail' || target.kind === 'order_case_chat') {
        return entries.some((entry) => {
          if (entry.isClosing || entry.key !== 'orderCase.details') {
            return false
          }
          const payload = entry.payload as { orderCaseClientId?: string } | undefined
          return payload?.orderCaseClientId === target.params.orderCaseClientId
        })
      }

      return false
    })
    .map((notification) => notification.notification_id)
}

export function AdminNotificationsActiveViewBridge() {
  const sectionManager = useSectionManager()
  const sectionEntries = useStackActionEntries(sectionManager)

  useEffect(() => {
    const matchingIds = collectActiveNotificationIds(sectionEntries)
    if (matchingIds.length === 0) {
      return
    }

    markAdminNotificationsReadLocally(matchingIds)
    notificationsChannel.markRead(matchingIds)
  }, [sectionEntries])

  return null
}
