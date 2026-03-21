import type { ReactNode } from 'react'

import { copyToClipboard, safeJson } from '../message'
import {
  actionRowStyle,
  assistantMessageBodyStyle,
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
import type {
  AiActionDescriptor,
  AiBlockRenderer,
  AiLegacyDataToBlocksMapper,
  AiMessageBlock,
  AiPanelMessage,
  AiPanelTheme,
} from '../types'

interface AiPanelMessageCardProps {
  message: AiPanelMessage
  theme: AiPanelTheme
  activeActionId: string | null
  mapLegacyDataToBlocks?: AiLegacyDataToBlocksMapper
  renderBlock?: AiBlockRenderer
  onAction: (action: AiActionDescriptor) => Promise<void>
}

function renderBlockData(data: unknown, theme: AiPanelTheme): ReactNode {
  if (Array.isArray(data)) {
    return (
      <pre style={traceCodeStyle(theme)}>{safeJson(data)}</pre>
    )
  }

  if (!data || typeof data !== 'object') {
    return <div style={traceSummaryStyle(theme)}>{String(data ?? '')}</div>
  }

  const record = data as Record<string, unknown>
  const items = Array.isArray(record.items) ? record.items : null

  if (items && items.length > 0) {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {items.slice(0, 6).map((item, index) => (
          <div
            key={index}
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: '8px 10px',
              background: theme.surfaceAlt,
              display: 'grid',
              gap: 4,
            }}
          >
            {typeof item === 'object' && item !== null
              ? Object.entries(item as Record<string, unknown>).slice(0, 5).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 6 }}>
                    <strong style={{ color: theme.muted, fontSize: 11, textTransform: 'uppercase' }}>{k}</strong>
                    <span style={{ color: theme.text, fontSize: 12 }}>{String(v ?? '')}</span>
                  </div>
                ))
              : <span style={{ color: theme.text, fontSize: 12 }}>{String(item)}</span>}
          </div>
        ))}
      </div>
    )
  }

  return <pre style={traceCodeStyle(theme)}>{safeJson(data)}</pre>
}

function renderFallbackBlock(
  block: AiMessageBlock,
  theme: AiPanelTheme,
  activeActionId: string | null,
  onAction: (action: AiActionDescriptor) => Promise<void>,
): ReactNode {
  return (
    <section
      key={block.id ?? `${block.kind}-${block.entityType ?? 'generic'}-${block.title ?? 'block'}`}
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        padding: 10,
        background: theme.surface,
        display: 'grid',
        gap: 8,
      }}
    >
      {(block.title || block.subtitle || block.entityType) ? (
        <div style={{ display: 'grid', gap: 2 }}>
          {block.title ? <strong style={{ color: theme.text, fontSize: 13 }}>{block.title}</strong> : null}
          {block.subtitle ? <span style={{ color: theme.muted, fontSize: 12 }}>{block.subtitle}</span> : null}
          {block.entityType ? (
            <span style={{ color: theme.accent, fontSize: 11, textTransform: 'uppercase' }}>{block.entityType}</span>
          ) : null}
        </div>
      ) : null}
      {renderBlockData(block.data, theme)}
      {block.actions?.length ? (
        <div style={actionRowStyle}>
          {block.actions.map((action) => {
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
    </section>
  )
}

export function AiPanelMessageCard({
  message,
  theme,
  activeActionId,
  mapLegacyDataToBlocks,
  renderBlock: renderCustomBlock,
  onAction,
}: AiPanelMessageCardProps) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'
  const isStatus = message.role === 'status'
  const isAssistant = !isUser && !isError && !isStatus
  const headerLabel = isError ? 'Issue' : isStatus ? 'Status' : null

  const blocks = message.blocks?.length
    ? message.blocks
    : (message.data !== undefined && message.data !== null && mapLegacyDataToBlocks
        ? mapLegacyDataToBlocks(message.data) ?? []
        : [])
  const continuePromptInteractions = message.interactions?.filter(
    (interaction) => interaction.kind === 'continue_prompt',
  ) ?? []
  const showRawDataPreview = message.data !== undefined && message.data !== null && blocks.length === 0

  return (
    <article
      style={{
        ...messageCardStyle(theme, message.role),
        alignSelf: isUser ? 'flex-end' : 'stretch',
        marginLeft: isUser ? 'auto' : 0,
      }}
    >
      {(headerLabel || message.statusLabel) ? (
        <div style={messageHeaderStyle(theme.header, isUser)}>
          {headerLabel ? <span>{headerLabel}</span> : <span />}
          {message.statusLabel ? <span style={messageBadgeStyle(theme)}>{message.statusLabel}</span> : null}
        </div>
      ) : null}
      <div style={isAssistant ? assistantMessageBodyStyle(theme) : messageBodyStyle(theme)}>
        {message.content}
      </div>
      {blocks.length ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {blocks.map((block, index) => {
            const blockKey = block.id ?? `${block.kind}-${block.entityType ?? 'generic'}-${index}`
            const customBlock = renderCustomBlock?.({
              block,
              message,
              theme,
              activeActionId,
              onAction,
            })

            return (
              <div key={blockKey}>
                {customBlock ?? renderFallbackBlock(block, theme, activeActionId, onAction)}
              </div>
            )
          })}
        </div>
      ) : null}
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
      {continuePromptInteractions.length ? (
        <div style={actionRowStyle}>
          {continuePromptInteractions.map((interaction) => {
              const interactionId = interaction.id ?? `${interaction.kind}-${interaction.label}`
              return (
                <button
                  key={interactionId}
                  disabled={interaction.disabled}
                  onClick={() => {
                    void onAction({
                      type: 'interaction:continue_prompt',
                      label: interaction.label,
                      payload: {
                        interaction_id: interaction.id,
                        interaction,
                      },
                    })
                  }}
                  style={buttonStyle(theme, 'secondary', interaction.disabled)}
                  title={interaction.hint}
                  type="button"
                >
                  {interaction.label}
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
      {showRawDataPreview ? (
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
