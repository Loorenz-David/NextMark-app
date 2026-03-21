import { useState, type PointerEvent as ReactPointerEvent } from 'react'

import { AiPanelComposer } from './AiPanelComposer'
import { AiPanelBlockingInteraction } from './AiPanelBlockingInteraction'
import { AiPanelHeader } from './AiPanelHeader'
import { AiPanelTranscript } from './AiPanelTranscript'
import { mobileHandleStyle, mobileSheetStyle, panelShellStyle } from '../styles'
import type {
  AiActionDescriptor,
  AIInteraction,
  AiPanelMessage,
  AiPanelProviderProps,
  AiPanelTheme,
} from '../types'

function getBlockingInteraction(messages: AiPanelMessage[]): AIInteraction | null {
  const last = messages[messages.length - 1]
  if (!last?.interactions?.length) {
    return null
  }

  return last.interactions.find((interaction) => (
    interaction.kind === 'question' || interaction.kind === 'confirm'
  )) ?? null
}

interface SharedSurfaceProps {
  title: string
  subtitle: string
  placeholder: string
  messages: AiPanelMessage[]
  mapLegacyDataToBlocks?: AiPanelProviderProps['mapLegacyDataToBlocks']
  renderBlock?: AiPanelProviderProps['renderBlock']
  composerValue: string
  isLoading: boolean
  loadingStatusText: string
  activeActionId: string | null
  theme: AiPanelTheme
  renderEmptyState?: AiPanelProviderProps['renderEmptyState']
  onComposerChange: (value: string) => void
  onClose: () => void
  onClear: () => void
  onRetry: () => Promise<void>
  onSend: () => Promise<void>
  runAction: (action: AiActionDescriptor) => Promise<void>
}

interface DesktopPanelProps extends SharedSurfaceProps {
  size: { width: number; height: number }
  position: { x: number; y: number }
  isDragging: boolean
  onDragStart: (event: ReactPointerEvent<HTMLElement>) => void
}

export function DesktopPanel({
  size,
  position,
  isDragging,
  onDragStart,
  ...surfaceProps
}: DesktopPanelProps) {
  const [isHoveringPanel, setIsHoveringPanel] = useState(false)
  const headerVisible = isHoveringPanel || isDragging
  const blockingInteraction = getBlockingInteraction(surfaceProps.messages)
  const closeDisabled = Boolean(blockingInteraction?.required)

  return (
    <section
      aria-label="AI companion panel"
      onMouseEnter={() => setIsHoveringPanel(true)}
      onMouseLeave={() => setIsHoveringPanel(false)}
      style={{
        ...panelShellStyle(surfaceProps.theme),
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
      }}
    >
      <AiPanelHeader
        closeDisabled={closeDisabled}
        closeDisabledReason={closeDisabled ? 'Answer the required interaction before closing this panel.' : undefined}
        mobile={false}
        onClose={surfaceProps.onClose}
        onDragStart={onDragStart}
        theme={surfaceProps.theme}
        visible={headerVisible}
      />
      <AiPanelTranscript {...surfaceProps} />
      {blockingInteraction ? (
        <AiPanelBlockingInteraction
          interaction={blockingInteraction}
          isLoading={surfaceProps.isLoading}
          runAction={surfaceProps.runAction}
          theme={surfaceProps.theme}
        />
      ) : (
        <AiPanelComposer
          disabled={surfaceProps.isLoading}
          onChange={surfaceProps.onComposerChange}
          onSubmit={surfaceProps.onSend}
          placeholder={surfaceProps.placeholder}
          theme={surfaceProps.theme}
          value={surfaceProps.composerValue}
        />
      )}
    </section>
  )
}

type MobileSheetProps = SharedSurfaceProps

export function MobileSheet(surfaceProps: MobileSheetProps) {
  const blockingInteraction = getBlockingInteraction(surfaceProps.messages)
  const closeDisabled = Boolean(blockingInteraction?.required)

  return (
    <section aria-label="AI companion panel" style={mobileSheetStyle(surfaceProps.theme)}>
      <div style={mobileHandleStyle(surfaceProps.theme)} />
      <AiPanelHeader
        closeDisabled={closeDisabled}
        closeDisabledReason={closeDisabled ? 'Answer the required interaction before closing this panel.' : undefined}
        mobile={true}
        onClose={surfaceProps.onClose}
        theme={surfaceProps.theme}
        visible={true}
      />
      <AiPanelTranscript {...surfaceProps} />
      {blockingInteraction ? (
        <AiPanelBlockingInteraction
          interaction={blockingInteraction}
          isLoading={surfaceProps.isLoading}
          runAction={surfaceProps.runAction}
          theme={surfaceProps.theme}
        />
      ) : (
        <AiPanelComposer
          disabled={surfaceProps.isLoading}
          onChange={surfaceProps.onComposerChange}
          onSubmit={surfaceProps.onSend}
          placeholder={surfaceProps.placeholder}
          theme={surfaceProps.theme}
          value={surfaceProps.composerValue}
        />
      )}
    </section>
  )
}
