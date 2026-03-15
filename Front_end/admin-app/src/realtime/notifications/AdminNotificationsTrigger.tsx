import { useMemo, useState, useSyncExternalStore } from 'react'
import { ArchiveIcon } from '@/assets/icons'
import { useOrderActions } from '@/features/order/actions/order.actions'
import { useCaseOrderActions } from '@/features/orderCase/pages/order/order.actions'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import { formatIsoDateRelative } from '@/shared/utils/formatIsoDate'
import { createNotificationsChannel, type NotificationItem } from '@shared-realtime'
import { adminRealtimeClient } from '@/realtime/client'
import {
  getAdminNotificationSnapshot,
  markAdminNotificationsReadLocally,
  subscribeAdminNotifications,
} from './notification.store'

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

  const content = useMemo(() => {
    if (items.length === 0) {
      return (
        <div className="rounded-2xl border border-[var(--color-muted)]/15 bg-white p-4 text-sm text-[var(--color-muted)] shadow-xl">
          No unread notifications.
        </div>
      )
    }

    return (
      <div className="max-h-[420px] w-[360px] overflow-y-auto rounded-2xl border border-[var(--color-muted)]/15 bg-white p-2 shadow-2xl">
        <div className="border-b border-[var(--color-muted)]/10 px-3 py-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Notifications</h3>
        </div>
        <div className="divide-y divide-[var(--color-muted)]/10">
          {items.map((notification) => (
            <button
              key={notification.notification_id}
              className="flex w-full flex-col gap-2 px-3 py-3 text-left transition hover:bg-[var(--color-page)]/70"
              data-popover-close
              onClick={() => {
                openAdminNotification(notification, {
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
                <div>
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
          ))}
        </div>
      </div>
    )
  }, [items, openCaseDetails, openOrderDetail])

  return (
    <FloatingPopover
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      renderInPortal
      closeOnInsideClick
      reference={(
        <div className="relative">
          <BasicButton
            params={{
              variant: 'secondary',
              ariaLabel: 'Notifications',
              className: 'border-[var(--color-muted)]/30',
              onClick: () => setIsOpen((current) => !current),
            }}
          >
            <ArchiveIcon className="h-5 w-5 " />
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

function openAdminNotification(
  notification: NotificationItem,
  actions: {
    openOrderDetail: ReturnType<typeof useOrderActions>['openOrderDetail']
    openCaseDetails: ReturnType<typeof useCaseOrderActions>['openCaseDetails']
  },
) {
  const { target } = notification

  if (target.kind === 'order_detail' && typeof target.params.orderId === 'number') {
    actions.openOrderDetail(
      { serverId: target.params.orderId, mode: 'view' },
      {
        pageClass: 'bg-[var(--color-muted)]/10',
        borderLeft: 'rgb(var(--color-light-blue-r),0.7)',
      },
    )
    return
  }

  if (
    (target.kind === 'order_case_detail' || target.kind === 'order_case_chat')
    && typeof target.params.orderCaseClientId === 'string'
    && target.params.orderCaseClientId
  ) {
    actions.openCaseDetails(target.params.orderCaseClientId)
  }
}
