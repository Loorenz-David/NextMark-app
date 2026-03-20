import type { AiPanelTheme } from './types'

export const defaultTheme: AiPanelTheme = {
  accent: '#8BE3C8',
  background: 'rgba(12, 16, 18, 0.76)',
  surface: '#202628',
  surfaceAlt: '#293033',
  text: '#F5F7F5',
  muted: '#9FA8A4',
  border: 'rgba(255,255,255,0.12)',
  shadow: '0 30px 90px rgba(0,0,0,0.34)',
  launcherAccent: '#B7F171',
  fontFamily: '"SF Pro Display", "Avenir Next", "Segoe UI", sans-serif',
}

export function mergeAiPanelTheme(theme?: Partial<AiPanelTheme>): AiPanelTheme {
  return {
    ...defaultTheme,
    ...theme,
  }
}
