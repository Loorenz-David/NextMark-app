import type { PropsWithChildren } from 'react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AiPanelProvider, type AiActionDescriptor } from '@nextmark/ai-panel'

import { resetQuery, setQueryFilters, setQuerySearch, updateQueryFilters } from '@/features/order/store/orderQuery.store'
import type { OrderQueryFilters } from '@/features/order/types/orderMeta'
import { AdminAiBlockRenderer } from '../components/AdminAiBlockRenderer'
import { adminAiPanelTransport } from '../domain/adminAiPanelAdapter'
import { mapLegacyAiDataToBlocks } from '../domain/mapLegacyAiDataToBlocks'
import { normalizeApplyOrderFiltersPayload, type ApplyOrderFiltersPayload } from '../domain/normalizeApplyOrderFiltersPayload'

type NavigatePayload = {
  path?: string
}

type CopyTextPayload = {
  text?: string
}

export function AdminAiPanelProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()

  const renderBlock = useCallback((props: Parameters<typeof AdminAiBlockRenderer>[0]) => (
    <AdminAiBlockRenderer {...props} />
  ), [])

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
          const normalizedPayload = normalizeApplyOrderFiltersPayload(payload)
          navigate('/')

          if (normalizedPayload.mode === 'replace') {
            resetQuery()
          }

          if (typeof normalizedPayload.search === 'string') {
            setQuerySearch(normalizedPayload.search)
          }

          if (Object.keys(normalizedPayload.filters).length > 0) {
            if (normalizedPayload.mode === 'replace') {
              setQueryFilters(normalizedPayload.filters as OrderQueryFilters)
            } else {
              updateQueryFilters(normalizedPayload.filters)
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
      mapLegacyDataToBlocks={mapLegacyAiDataToBlocks}
      placeholder="Ask logistics, planning, or navigation questions..."
      renderBlock={renderBlock}
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
