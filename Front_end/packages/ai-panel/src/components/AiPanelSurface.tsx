import type { PointerEvent as ReactPointerEvent } from 'react'

import { AiPanelComposer } from './AiPanelComposer'
import { AiPanelHeader } from './AiPanelHeader'
import { AiPanelTranscript } from './AiPanelTranscript'
import { mobileHandleStyle, mobileSheetStyle, panelShellStyle } from '../styles'
import type {
  AiActionDescriptor,
  AiPanelMessage,
  AiPanelProviderProps,
  AiPanelTheme,
} from '../types'

interface SharedSurfaceProps {
  title: string
  subtitle: string
  placeholder: string
  messages: AiPanelMessage[]
  composerValue: string
  isLoading: boolean
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
  onDragStart: (event: ReactPointerEvent<HTMLElement>) => void
}

export function DesktopPanel({
  size,
  position,
  onDragStart,
  ...surfaceProps
}: DesktopPanelProps) {
  return (
    <section
      aria-label="AI companion panel"
      style={{
        ...panelShellStyle(surfaceProps.theme),
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
      }}
    >
      <AiPanelHeader {...surfaceProps} onDragStart={onDragStart} />
      <AiPanelTranscript {...surfaceProps} />
      <AiPanelComposer
        disabled={surfaceProps.isLoading}
        onChange={surfaceProps.onComposerChange}
        onSubmit={surfaceProps.onSend}
        placeholder={surfaceProps.placeholder}
        theme={surfaceProps.theme}
        value={surfaceProps.composerValue}
      />
    </section>
  )
}

type MobileSheetProps = SharedSurfaceProps

export function MobileSheet(surfaceProps: MobileSheetProps) {
  return (
    <section aria-label="AI companion panel" style={mobileSheetStyle(surfaceProps.theme)}>
      <div style={mobileHandleStyle(surfaceProps.theme)} />
      <AiPanelHeader {...surfaceProps} />
      <AiPanelTranscript {...surfaceProps} />
      <AiPanelComposer
        disabled={surfaceProps.isLoading}
        onChange={surfaceProps.onComposerChange}
        onSubmit={surfaceProps.onSend}
        placeholder={surfaceProps.placeholder}
        theme={surfaceProps.theme}
        value={surfaceProps.composerValue}
      />
    </section>
  )
}
