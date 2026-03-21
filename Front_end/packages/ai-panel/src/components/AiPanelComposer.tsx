import type { AiPanelTheme } from '../types'
import { useRef, useEffect } from 'react'
import {
  buttonStyle,
  composerActionsRowStyle,
  composerFooterStyle,
  composerFrameStyle,
  composerHintStyle,
  composerInputStyle,
  composerShellStyle,
  composerSubmitButtonStyle,
  composerTopRowStyle,
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
  const composerTheme = theme.composer
  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  };



  return (
    <div style={composerShellStyle(composerTheme)}>
      <div style={composerFrameStyle(composerTheme)}>
        <div style={composerTopRowStyle()}>
          <textarea

            disabled={disabled}
            onInput={(event) => resize(event.currentTarget)}
            onChange={(event) => {
              onChange(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void onSubmit()
              }
            }}
            placeholder={placeholder}
            rows={1}
            style={composerInputStyle(composerTheme)}
            value={value}

          />
        </div>
        <div style={composerActionsRowStyle(composerTheme)}>
          <div style={composerFooterStyle}>
            <div style={composerHintStyle(composerTheme)}></div>
            <button
              disabled={disabled || !value.trim()}
              onClick={() => void onSubmit()}
              style={composerSubmitButtonStyle(composerTheme, disabled || !value.trim())}
              type="button"
            >
              <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block', transform: 'rotate(90deg)' }}
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"/>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/>
                <g id="SVGRepo_iconCarrier"><path d="M6 12H18M6 12L11 7M6 12L11 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


