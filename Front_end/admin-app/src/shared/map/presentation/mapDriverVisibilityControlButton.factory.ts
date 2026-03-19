const applySharedButtonStyles = (button: HTMLButtonElement) => {
  button.style.width = '42px'
  button.style.height = '42px'
  button.style.border = '1px solid rgba(255, 255, 255, 0.12)'
  button.style.borderRadius = '9999px'
  button.style.background = 'rgba(14, 22, 23, 0.72)'
  button.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.18)'
  button.style.cursor = 'pointer'
  button.style.display = 'flex'
  button.style.alignItems = 'center'
  button.style.justifyContent = 'center'
  button.style.transition = 'background-color 160ms ease, border-color 160ms ease, color 160ms ease'
}

export const createDriverVisibilityControlButton = ({
  onClick,
  isVisible,
}: {
  onClick: () => void
  isVisible: boolean
}) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'map-control-driver-visibility'
  applySharedButtonStyles(button)

  const icon = document.createElement('span')
  icon.setAttribute('aria-hidden', 'true')
  icon.style.width = '18px'
  icon.style.height = '18px'
  icon.style.borderRadius = '9999px'
  icon.style.border = '2px solid currentColor'
  icon.style.boxSizing = 'border-box'
  icon.style.display = 'inline-flex'
  icon.style.alignItems = 'center'
  icon.style.justifyContent = 'center'

  const dot = document.createElement('span')
  dot.style.width = '6px'
  dot.style.height = '6px'
  dot.style.borderRadius = '9999px'
  dot.style.background = 'currentColor'
  icon.appendChild(dot)
  button.appendChild(icon)

  const syncState = (visible: boolean) => {
    button.title = visible ? 'Hide driver locations' : 'Show driver locations'
    button.setAttribute('aria-label', button.title)
    button.setAttribute('aria-pressed', visible ? 'true' : 'false')
    button.style.color = visible ? 'rgb(184, 255, 242)' : 'rgba(248, 251, 252, 0.72)'
    button.style.borderColor = visible ? 'rgba(104, 214, 195, 0.28)' : 'rgba(255, 255, 255, 0.12)'
    button.style.background = visible
      ? 'rgba(24, 58, 60, 0.96)'
      : 'rgba(14, 22, 23, 0.72)'
    button.style.outline = 'none'
  }

  syncState(isVisible)
  button.onclick = onClick

  return {
    button,
    syncState,
  }
}
