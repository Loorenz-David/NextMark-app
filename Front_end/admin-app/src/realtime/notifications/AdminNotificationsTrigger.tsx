import { useMemo, useState, useSyncExternalStore } from 'react'
import { BellIcon, CloseIcon } from '@/assets/icons'
import { useOrderActions } from '@/features/order/actions/order.actions'
import { useCaseOrderActions } from '@/features/orderCase/pages/order/order.actions'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'
import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import { createNotificationsChannel } from '@shared-realtime'
import { adminRealtimeClient } from '@/realtime/client'
import type { PayloadBase } from '@/features/home/types/types'
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
  subscribeAdminNotifications,
} from './notification.store'
import { openAdminNotificationTarget } from './adminNotificationTargets'

const notificationsChannel = createNotificationsChannel(adminRealtimeClient)

export function AdminNotificationsTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, unreadCount } = useSyncExternalStore(
    subscribeAdminNotifications,
    getAdminNotificationSnapshot,
    getAdminNotificationSnapshot,
  )
  const { openOrderDetail } = useOrderActions()
  const { openCaseDetails } = useCaseOrderActions()
  const baseControls = useBaseControlls<PayloadBase>()

  const content = useMemo(() => {
    if (items.length === 0) {
      return (
        <div className="admin-glass-popover admin-surface-compact rounded-2xl p-4 text-sm text-[var(--color-muted)]">
          No unread notifications.
        </div>
      )
    }

    return (
      <div className="admin-glass-popover admin-surface-compact max-h-[420px] w-[360px] overflow-y-auto rounded-2xl p-2">
        <div className="admin-glass-divider border-b px-3 py-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Notifications</h3>
        </div>
        <div className="divide-y divide-white/8">
          {items.map((notification) => (
            <div
              key={notification.notification_id}
              className="group flex gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.05]"
            >
              <button
                className="flex min-w-0 flex-1 flex-col gap-2 text-left"
                data-popover-close
                onClick={() => {
                  openAdminNotificationTarget(notification, {
                    openLocalDeliveryWorkspace: baseControls.openBase,
                    openOrderDetail,
                    openCaseDetails,
                  })
                  setIsOpen(false)
                  markAdminNotificationsReadLocally([notification.notification_id])
                  notificationsChannel.markRead([notification.notification_id])
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{notification.title}</p>
                    <p className="text-sm text-[var(--color-muted)]">{notification.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    {formatIsoDateRelative(notification.occurred_at) ?? notification.occurred_at}
                  </span>
                </div>
                {notification.actor_username ? (
                  <span className="text-xs font-medium text-[var(--color-text)]/70">
                    {notification.actor_username}
                  </span>
                ) : null}
              </button>

              <button
                aria-label="Mark notification as read"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] opacity-70 transition hover:bg-white/[0.07] hover:opacity-100"
                onClick={() => {
                  markAdminNotificationsReadLocally([notification.notification_id])
                  notificationsChannel.markRead([notification.notification_id])
                }}
                type="button"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }, [baseControls.openBase, items, openCaseDetails, openOrderDetail])

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      renderInPortal
      closeOnInsideClick
      floatingClassName="drop-shadow-[0_24px_50px_rgba(0,0,0,0.3)]"
      reference={(
        <div className="relative">
          <BasicButton
            params={{
              variant: 'toolbarSecondary',
              ariaLabel: 'Notifications',
              className: 'border-[var(--color-muted)]/30 px-2.5',
              onClick: () => setIsOpen((current) => !current),
            }}
          >
            <BellIcon className="h-4.5 w-4.5" />
          </BasicButton>
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[rgb(var(--color-danger-r))] px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </div>
      )}
    >
      {content}
    </FloatingPopover>
  )
}
