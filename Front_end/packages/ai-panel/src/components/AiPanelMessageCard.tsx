import { copyToClipboard, safeJson } from '../message'
import {
  actionRowStyle,
  buttonStyle,
  dataPreviewStyle,
  detailsStyle,
  messageBadgeStyle,
  messageBodyStyle,
  messageCardStyle,
  messageFooterStyle,
  messageHeaderStyle,
  summaryStyle,
  traceCodeStyle,
  traceItemHeaderStyle,
  traceItemStyle,
  traceListStyle,
  traceStatusStyle,
  traceSummaryStyle,
  traceToolNameStyle,
} from '../styles'
import type { AiActionDescriptor, AiPanelMessage, AiPanelTheme } from '../types'

interface AiPanelMessageCardProps {
  message: AiPanelMessage
  theme: AiPanelTheme
  activeActionId: string | null
  onAction: (action: AiActionDescriptor) => Promise<void>
}

export function AiPanelMessageCard({
  message,
  theme,
  activeActionId,
  onAction,
}: AiPanelMessageCardProps) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  const isStatus = message.role === 'status'

  return (
    <article
      style={{
        ...messageCardStyle(theme, message.role),
        alignSelf: isUser ? 'flex-end' : 'stretch',
        marginLeft: isUser ? 'auto' : 0,
      }}
    >
      <div style={messageHeaderStyle(theme, isUser)}>
        <span>{isUser ? 'You' : isError ? 'Issue' : isStatus ? 'Status' : 'Assistant'}</span>
        {message.statusLabel ? <span style={messageBadgeStyle(theme)}>{message.statusLabel}</span> : null}
      </div>
      <div style={messageBodyStyle(theme)}>{message.content}</div>
      {message.actions?.length ? (
        <div style={actionRowStyle}>
          {message.actions.map((action) => {
            const actionId = action.id ?? `${action.type}-${action.label}`
            const isRunning = activeActionId === actionId || action.loading
            return (
              <button
                key={actionId}
                disabled={action.disabled || isRunning}
                onClick={() => void onAction(action)}
                style={buttonStyle(theme, action.variant ?? 'secondary', action.disabled || isRunning)}
                type="button"
              >
                {isRunning ? 'Working...' : action.label}
              </button>
            )
          })}
        </div>
      ) : null}
      {message.toolTrace?.length ? (
        <details style={detailsStyle(theme)}>
          <summary style={summaryStyle(theme)}>Tool trace</summary>
          <div style={traceListStyle}>
            {message.toolTrace.map((entry, index) => (
              <div key={entry.id ?? `${entry.tool}-${index}`} style={traceItemStyle(theme)}>
                <div style={traceItemHeaderStyle}>
                  <span style={traceToolNameStyle(theme)}>{entry.tool}</span>
                  <span style={traceStatusStyle(theme, entry.status ?? 'info')}>{entry.status ?? 'info'}</span>
                </div>
                {entry.summary ? <div style={traceSummaryStyle(theme)}>{entry.summary}</div> : null}
                {entry.params ? <pre style={traceCodeStyle(theme)}>{safeJson(entry.params)}</pre> : null}
                {entry.result ? <pre style={traceCodeStyle(theme)}>{safeJson(entry.result)}</pre> : null}
              </div>
            ))}
          </div>
        </details>
      ) : null}
      {message.data !== undefined && message.data !== null ? (
        <pre style={dataPreviewStyle(theme)}>{safeJson(message.data)}</pre>
      ) : null}
      {!isUser ? (
        <div style={messageFooterStyle}>
          <button
            onClick={() => void copyToClipboard(message.content)}
            style={buttonStyle(theme, 'ghost')}
            type="button"
          >
            Copy
          </button>
        </div>
      ) : null}
    </article>
  )
}
