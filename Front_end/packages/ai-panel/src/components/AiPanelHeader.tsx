import type { PointerEvent as ReactPointerEvent } from 'react'

import { buttonStyle, dragHandleStyle, headerActionsStyle, headerEyebrowStyle, headerStyle, headerSubtitleStyle, headerTitleStyle } from '../styles'
import type { AiPanelTheme } from '../types'

interface AiPanelHeaderProps {
  title: string
  subtitle: string
  theme: AiPanelTheme
  onClose: () => void
  onClear: () => void
  onRetry: () => Promise<void>
  onDragStart?: (event: ReactPointerEvent<HTMLElement>) => void
}

export function AiPanelHeader({
  title,
  subtitle,
  theme,
  onClose,
  onClear,
  onRetry,
  onDragStart,
}: AiPanelHeaderProps) {
  return (
    <header style={headerStyle(theme)}>
      <div onPointerDown={onDragStart} style={dragHandleStyle(theme)}>
        <span style={headerEyebrowStyle(theme)}>AI</span>
        <div>
          <div style={headerTitleStyle(theme)}>{title}</div>
          <div style={headerSubtitleStyle(theme)}>{subtitle}</div>
        </div>
      </div>
      <div style={headerActionsStyle}>
        <button onClick={() => void onRetry()} style={buttonStyle(theme, 'ghost')} type="button">
          Retry
        </button>
        <button onClick={onClear} style={buttonStyle(theme, 'ghost')} type="button">
          Clear
        </button>
        <button onClick={onClose} style={buttonStyle(theme, 'secondary')} type="button">
          Hide
        </button>
      </div>
    </header>
  )
}
