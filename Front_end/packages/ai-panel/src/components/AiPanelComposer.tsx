import type { AiPanelTheme } from '../types'
import {
  buttonStyle,
  composerFooterStyle,
  composerHintStyle,
  composerInputStyle,
  composerShellStyle,
} from '../styles'

interface AiPanelComposerProps {
  value: string
  placeholder: string
  disabled: boolean
  theme: AiPanelTheme
  onChange: (value: string) => void
  onSubmit: () => Promise<void>
}

export function AiPanelComposer({
  value,
  placeholder,
  disabled,
  theme,
  onChange,
  onSubmit,
}: AiPanelComposerProps) {
  return (
    <div style={composerShellStyle(theme)}>
      <textarea
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void onSubmit()
          }
        }}
        placeholder={placeholder}
        rows={3}
        style={composerInputStyle(theme)}
        value={value}
      />
      <div style={composerFooterStyle}>
        <div style={composerHintStyle(theme)}>Enter to send, Shift+Enter for a new line</div>
        <button
          disabled={disabled || !value.trim()}
          onClick={() => void onSubmit()}
          style={buttonStyle(theme, 'primary', disabled || !value.trim())}
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  )
}
