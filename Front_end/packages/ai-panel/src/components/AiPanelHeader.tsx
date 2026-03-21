import type { PointerEvent as ReactPointerEvent } from 'react'

import {
  dragHandleStyle,
  headerActionDockStyle,
  headerActionsStyle,
  headerCloseButtonStyle,
  headerCloseGlyphStyle,
  headerStyle,
} from '../styles'
import type { AiPanelTheme } from '../types'

interface AiPanelHeaderProps {
  theme: AiPanelTheme
  visible: boolean
  mobile?: boolean
  onClose: () => void
  onDragStart?: (event: ReactPointerEvent<HTMLElement>) => void
}

export function AiPanelHeader({
  theme,
  visible,
  mobile = false,
  onClose,
  onDragStart,
}: AiPanelHeaderProps) {
  const headerTheme = theme.header
  return (
    <header onPointerDown={onDragStart} style={headerStyle(headerTheme, visible, mobile)}>
      <div style={dragHandleStyle(headerTheme)}>
        <button
          aria-label="Hide AI panel"
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          style={headerCloseButtonStyle(headerTheme)}
          type="button"
        >
          <span style={headerCloseGlyphStyle}>×</span>
        </button>
      </div>
      <div style={headerActionsStyle}>
        <div style={headerActionDockStyle()} />
      </div>
    </header>
  )
}
