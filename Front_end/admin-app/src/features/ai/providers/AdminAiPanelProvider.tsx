import type { PropsWithChildren } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiPanelProvider, type AiActionDescriptor } from '@nextmark/ai-panel'

import { resetQuery, setQueryFilters, setQuerySearch, updateQueryFilters } from '@/features/order/store/orderQuery.store'
import type { OrderQueryFilters } from '@/features/order/types/orderMeta'
import { adminAiPanelTransport } from '../domain/adminAiPanelAdapter'

type NavigatePayload = {
  path?: string
}

type ApplyOrderFiltersPayload = {
  mode?: 'replace' | 'merge'
  search?: string
  filters?: Partial<OrderQueryFilters>
}

type CopyTextPayload = {
  text?: string
}

export function AdminAiPanelProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()

  const resolveAction = useCallback(
    async (action: AiActionDescriptor) => {
      switch (action.type) {
        case 'navigate': {
          const payload = action.payload as NavigatePayload | undefined
          if (!payload?.path) {
            throw new Error('AI action "navigate" is missing a path.')
          }
          navigate(payload.path)
          return
        }

        case 'open_settings': {
          navigate('/settings')
          return
        }

        case 'apply_order_filters': {
          const payload = action.payload as ApplyOrderFiltersPayload | undefined
          navigate('/')

          if (payload?.mode === 'replace') {
            resetQuery()
          }

          if (typeof payload?.search === 'string') {
            setQuerySearch(payload.search)
          }

          if (payload?.filters) {
            if (payload.mode === 'replace') {
              setQueryFilters(payload.filters as OrderQueryFilters)
            } else {
              updateQueryFilters(payload.filters)
            }
          }
          return
        }

        case 'copy_text': {
          const payload = action.payload as CopyTextPayload | undefined
          if (!payload?.text || !navigator.clipboard) {
            throw new Error('AI action "copy_text" is missing text.')
          }
          await navigator.clipboard.writeText(payload.text)
          return
        }

        default:
          throw new Error(`Unsupported AI action: ${action.type}`)
      }
    },
    [navigate],
  )

  return (
    <AiPanelProvider
      defaultOpen={false}
      launcherLabel="AI"
      mobileBreakpoint={1000}
      placeholder="Ask logistics, planning, or navigation questions..."
      resolveAction={resolveAction}
      storageKey="admin-app:ai-companion-panel"
      subtitle="AI logistics operator companion"
      title="NextMark AI"
      transport={adminAiPanelTransport}
    >
      {children}
    </AiPanelProvider>
  )
}
