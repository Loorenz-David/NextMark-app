import type { PointerEvent as ReactPointerEvent } from 'react'

import { launcherLabelStyle, launcherPulseStyle, launcherStyle } from '../styles'
import type { AiPanelTheme } from '../types'

interface FloatingLauncherProps {
  label: string
  theme: AiPanelTheme
  position: { x: number; y: number }
  onOpen: () => void
  onDragStart: (event: ReactPointerEvent<HTMLElement>) => void
}

export function FloatingLauncher({
  label,
  theme,
  position,
  onOpen,
  onDragStart,
}: FloatingLauncherProps) {
  return (
    <button
      aria-label="Open AI panel"
      onClick={onOpen}
      onPointerDown={onDragStart}
      style={{
        ...launcherStyle(theme),
        left: position.x,
        top: position.y,
      }}
      type="button"
    >
      <span style={launcherPulseStyle(theme)} />
      <span style={launcherLabelStyle(theme)}>{label}</span>
    </button>
  )
}
