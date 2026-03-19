import { useEffect } from 'react'
import { createNotificationsChannel } from '@shared-realtime'
import { adminRealtimeClient } from '@/realtime/client'
import type { PayloadBase } from '@/features/home/types/types'
import { useBaseControlls, useSectionManager } from '@/shared/resource-manager/useResourceManager'
import { useStackActionEntries } from '@/shared/stack-manager/useStackActionEntries'
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
} from './notification.store'
import { matchesAdminNotificationTarget } from './adminNotificationTargets'

const notificationsChannel = createNotificationsChannel(adminRealtimeClient)

const collectActiveNotificationIds = (
  entries: ReturnType<typeof useStackActionEntries>,
  isBaseOpen: boolean,
  basePayload?: PayloadBase,
) => {
  const notifications = getAdminNotificationSnapshot().items
  if (notifications.length === 0) {
    return []
  }

  return notifications
    .filter((notification) => matchesAdminNotificationTarget(notification, { basePayload, isBaseOpen, sectionEntries: entries }))
    .map((notification) => notification.notification_id)
}

export function AdminNotificationsActiveViewBridge() {
  const sectionManager = useSectionManager()
  const baseControls = useBaseControlls<PayloadBase>()
  const sectionEntries = useStackActionEntries(sectionManager)

  useEffect(() => {
    const matchingIds = collectActiveNotificationIds(
      sectionEntries,
      baseControls.isBaseOpen,
      baseControls.payload,
    )
    if (matchingIds.length === 0) {
      return
    }

    markAdminNotificationsReadLocally(matchingIds)
    notificationsChannel.markRead(matchingIds)
  }, [baseControls.isBaseOpen, baseControls.payload, sectionEntries])

  return null
}
