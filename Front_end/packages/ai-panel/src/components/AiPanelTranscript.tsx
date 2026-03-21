import { useEffect, useRef } from 'react'

import { AiPanelLoadingStatus } from './AiPanelLoadingStatus'
import { AiPanelMessageCard } from './AiPanelMessageCard'
import {
  emptyStateBodyStyle,
  emptyStateStyle,
  emptyStateTitleStyle,
  statusMessageStyle,
  transcriptStyle,
} from '../styles'
import type { AiActionDescriptor, AiPanelMessage, AiPanelProviderProps, AiPanelTheme } from '../types'

interface AiPanelTranscriptProps {
  messages: AiPanelMessage[]
  isLoading: boolean
  loadingStatusText: string
  activeActionId: string | null
  theme: AiPanelTheme
  renderEmptyState?: AiPanelProviderProps['renderEmptyState']
  mapLegacyDataToBlocks?: AiPanelProviderProps['mapLegacyDataToBlocks']
  renderBlock?: AiPanelProviderProps['renderBlock']
  runAction: (action: AiActionDescriptor) => Promise<void>
}

export function AiPanelTranscript({
  messages,
  isLoading,
  loadingStatusText,
  activeActionId,
  theme,
  renderEmptyState,
  mapLegacyDataToBlocks,
  renderBlock,
  runAction,
}: AiPanelTranscriptProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) {
      return
    }

    node.scrollTop = node.scrollHeight
  }, [isLoading, messages])

  return (
    <div ref={scrollerRef} style={transcriptStyle}>
      {messages.length === 0 ? (
        <div style={emptyStateStyle(theme)}>
          {renderEmptyState ?? (
            <>
              <div style={emptyStateTitleStyle(theme)}>AI lives above the app.</div>
              <div style={emptyStateBodyStyle(theme)}>
                Ask for plans, orders, filters, and guided navigation without leaving the current workspace.
              </div>
            </>
          )}
        </div>
      ) : null}
      {messages.map((message) => (
        <AiPanelMessageCard
          key={message.id}
          activeActionId={activeActionId}
          mapLegacyDataToBlocks={mapLegacyDataToBlocks}
          message={message}
          onAction={runAction}
          renderBlock={renderBlock}
          theme={theme}
        />
      ))}
      {isLoading ? (
        <div style={statusMessageStyle(theme)}>
          <AiPanelLoadingStatus
            statusText={loadingStatusText || 'The assistant is resolving the next step.'}
            theme={theme}
          />
        </div>
      ) : null}
    </div>
  )
}
