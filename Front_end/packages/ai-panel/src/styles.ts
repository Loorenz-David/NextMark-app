import type { CSSProperties } from 'react'

import { DEFAULT_LAUNCHER_SIZE, OVERLAY_Z_INDEX } from './constants'
import type { AiPanelMessage, AiPanelTheme } from './types'

export function panelShellStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'fixed',
    zIndex: OVERLAY_Z_INDEX,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 28,
    border: `1px solid ${theme.border}`,
    background: theme.background,
    backdropFilter: 'blur(24px)',
    boxShadow: theme.shadow,
    color: theme.text,
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
  }
}

export function mobileSheetStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'fixed',
    zIndex: OVERLAY_Z_INDEX,
    left: 0,
    right: 0,
    bottom: 0,
    height: '78dvh',
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    border: `1px solid ${theme.border}`,
    background: theme.background,
    backdropFilter: 'blur(24px)',
    boxShadow: theme.shadow,
    color: theme.text,
    overflow: 'hidden',
    fontFamily: theme.fontFamily,
  }
}

export function buttonStyle(
  theme: AiPanelTheme,
  variant: 'primary' | 'secondary' | 'ghost',
  disabled = false,
): CSSProperties {
  const shared: CSSProperties = {
    borderRadius: 999,
    border: '1px solid transparent',
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'opacity 120ms ease, transform 120ms ease',
  }

  if (variant === 'primary') {
    return {
      ...shared,
      background: theme.launcherAccent,
      color: '#132118',
    }
  }

  if (variant === 'secondary') {
    return {
      ...shared,
      background: theme.surfaceAlt,
      borderColor: theme.border,
      color: theme.text,
    }
  }

  return {
    ...shared,
    background: 'transparent',
    borderColor: theme.border,
    color: theme.muted,
  }
}

export const manualLauncherButtonStyle: CSSProperties = {
  borderRadius: 999,
  padding: '10px 14px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(18, 24, 27, 0.82)',
  color: '#F5F7F5',
  cursor: 'pointer',
}

export function launcherStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'fixed',
    zIndex: OVERLAY_Z_INDEX,
    width: DEFAULT_LAUNCHER_SIZE.width,
    height: DEFAULT_LAUNCHER_SIZE.height,
    borderRadius: 999,
    border: `1px solid ${theme.border}`,
    background: `radial-gradient(circle at 30% 20%, ${theme.launcherAccent}, ${theme.surface})`,
    color: '#0D1713',
    boxShadow: theme.shadow,
    cursor: 'grab',
    overflow: 'hidden',
  }
}

export function messageCardStyle(
  theme: AiPanelTheme,
  role: AiPanelMessage['role'],
): CSSProperties {
  const base: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    borderRadius: 24,
    padding: 16,
    border: `1px solid ${theme.border}`,
    maxWidth: '100%',
  }

  if (role === 'user') {
    return {
      ...base,
      background: `linear-gradient(135deg, ${theme.launcherAccent}, ${theme.accent})`,
      color: '#102018',
      width: 'fit-content',
      maxWidth: '88%',
    }
  }

  if (role === 'error') {
    return {
      ...base,
      background: 'rgba(115, 27, 32, 0.76)',
      color: '#FFECEC',
    }
  }

  if (role === 'status') {
    return {
      ...base,
      background: 'rgba(30, 43, 49, 0.78)',
      color: theme.text,
    }
  }

  return {
    ...base,
    background: theme.surface,
    color: theme.text,
  }
}

export const transcriptStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '18px 18px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

export function emptyStateStyle(theme: AiPanelTheme): CSSProperties {
  return {
    padding: '18px 6px 8px',
    color: theme.muted,
  }
}

export function headerStyle(theme: AiPanelTheme): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '18px 18px 12px',
    borderBottom: `1px solid ${theme.border}`,
  }
}

export function dragHandleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    cursor: 'grab',
    minWidth: 0,
    flex: 1,
    color: theme.text,
  }
}

export const headerActionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
}

export function headerEyebrowStyle(theme: AiPanelTheme): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 14,
    background: theme.surfaceAlt,
    color: theme.accent,
    fontWeight: 800,
    letterSpacing: '0.12em',
    fontSize: 11,
  }
}

export function headerTitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontWeight: 700,
    fontSize: 17,
    lineHeight: 1.2,
  }
}

export function headerSubtitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
  }
}

export function composerShellStyle(theme: AiPanelTheme): CSSProperties {
  return {
    padding: 18,
    borderTop: `1px solid ${theme.border}`,
    background: 'rgba(9, 13, 15, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }
}

export function composerInputStyle(theme: AiPanelTheme): CSSProperties {
  return {
    width: '100%',
    resize: 'none',
    borderRadius: 22,
    border: `1px solid ${theme.border}`,
    padding: '14px 16px',
    background: theme.surface,
    color: theme.text,
    outline: 'none',
    minHeight: 92,
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: theme.fontFamily,
  }
}

export const composerFooterStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}

export function composerHintStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 11,
  }
}

export function launcherPulseStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'absolute',
    inset: 10,
    borderRadius: 999,
    border: `1px solid ${theme.border}`,
    background: 'rgba(255,255,255,0.18)',
  }
}

export function launcherLabelStyle(theme: AiPanelTheme): CSSProperties {
  return {
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    fontWeight: 800,
    letterSpacing: '0.14em',
    fontSize: 12,
    color: '#15211A',
    fontFamily: theme.fontFamily,
  }
}

export function emptyStateTitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    fontWeight: 700,
    color: theme.text,
    marginBottom: 6,
  }
}

export function emptyStateBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    lineHeight: 1.5,
    fontSize: 14,
  }
}

export function messageHeaderStyle(theme: AiPanelTheme, isUser: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    color: isUser ? '#153121' : theme.muted,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }
}

export function messageBadgeStyle(theme: AiPanelTheme): CSSProperties {
  return {
    padding: '4px 8px',
    borderRadius: 999,
    background: theme.surfaceAlt,
    color: theme.text,
    fontSize: 10,
    letterSpacing: '0.05em',
  }
}

export function messageBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontSize: 14,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
  }
}

export const actionRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
}

export function detailsStyle(theme: AiPanelTheme): CSSProperties {
  return {
    borderRadius: 18,
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
  }
}

export function summaryStyle(theme: AiPanelTheme): CSSProperties {
  return {
    cursor: 'pointer',
    padding: '12px 14px',
    color: theme.text,
    fontWeight: 600,
    fontSize: 13,
  }
}

export const traceListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '0 12px 12px',
}

export function traceItemStyle(theme: AiPanelTheme): CSSProperties {
  return {
    borderRadius: 16,
    padding: 12,
    background: 'rgba(0,0,0,0.16)',
    border: `1px solid ${theme.border}`,
  }
}

export const traceItemHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  marginBottom: 6,
}

export function traceToolNameStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.text,
    fontWeight: 700,
    fontSize: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  }
}

export function traceStatusStyle(
  theme: AiPanelTheme,
  status: 'success' | 'error' | 'info',
): CSSProperties {
  const color =
    status === 'success' ? theme.accent : status === 'error' ? '#FF9B9B' : theme.muted

  return {
    color,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
  }
}

export function traceSummaryStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 8,
  }
}

export function traceCodeStyle(theme: AiPanelTheme): CSSProperties {
  return {
    margin: 0,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    fontSize: 11,
    lineHeight: 1.45,
    padding: 10,
    borderRadius: 12,
    background: 'rgba(0,0,0,0.22)',
    color: theme.text,
  }
}

export function dataPreviewStyle(theme: AiPanelTheme): CSSProperties {
  return {
    margin: 0,
    padding: 12,
    borderRadius: 16,
    background: theme.surfaceAlt,
    color: theme.text,
    fontSize: 11,
    lineHeight: 1.45,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  }
}

export const messageFooterStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
}

export function statusMessageStyle(theme: AiPanelTheme): CSSProperties {
  return {
    alignSelf: 'stretch',
    borderRadius: 18,
    padding: 14,
    background: theme.surfaceAlt,
    border: `1px dashed ${theme.border}`,
  }
}

export function statusTitleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    fontWeight: 700,
    color: theme.text,
    marginBottom: 4,
  }
}

export function statusBodyStyle(theme: AiPanelTheme): CSSProperties {
  return {
    color: theme.muted,
    fontSize: 13,
  }
}

export function mobileHandleStyle(theme: AiPanelTheme): CSSProperties {
  return {
    width: 54,
    height: 6,
    borderRadius: 999,
    background: theme.border,
    alignSelf: 'center',
    marginTop: 10,
  }
}
