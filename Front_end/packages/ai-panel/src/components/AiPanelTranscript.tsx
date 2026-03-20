import { useEffect, useRef } from 'react'

import { AiPanelMessageCard } from './AiPanelMessageCard'
import {
  emptyStateBodyStyle,
  emptyStateStyle,
  emptyStateTitleStyle,
  statusBodyStyle,
  statusMessageStyle,
  statusTitleStyle,
  transcriptStyle,
} from '../styles'
import type { AiActionDescriptor, AiPanelMessage, AiPanelProviderProps, AiPanelTheme } from '../types'

interface AiPanelTranscriptProps {
  messages: AiPanelMessage[]
  isLoading: boolean
  activeActionId: string | null
  theme: AiPanelTheme
  renderEmptyState?: AiPanelProviderProps['renderEmptyState']
  runAction: (action: AiActionDescriptor) => Promise<void>
}

export function AiPanelTranscript({
  messages,
  isLoading,
  activeActionId,
  theme,
  renderEmptyState,
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
          message={message}
          onAction={runAction}
          theme={theme}
        />
      ))}
      {isLoading ? (
        <div style={statusMessageStyle(theme)}>
          <div style={statusTitleStyle(theme)}>Working</div>
          <div style={statusBodyStyle(theme)}>The assistant is resolving the next step.</div>
        </div>
      ) : null}
    </div>
  )
}
