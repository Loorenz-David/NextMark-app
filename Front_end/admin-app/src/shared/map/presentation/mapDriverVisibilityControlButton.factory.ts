const applySharedButtonStyles = (button: HTMLButtonElement) => {
  button.style.width = '42px'
  button.style.height = '42px'
  button.style.border = 'none'
  button.style.borderRadius = '9999px'
  button.style.background = '#ffffff'
  button.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.18)'
  button.style.cursor = 'pointer'
  button.style.display = 'flex'
  button.style.alignItems = 'center'
  button.style.justifyContent = 'center'
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
    button.style.color = visible ? '#0f766e' : '#64748b'
    button.style.background = '#ffffff'
    button.style.outline = visible ? '2px solid rgba(15, 118, 110, 0.18)' : '2px solid rgba(100, 116, 139, 0.14)'
    button.style.outlineOffset = '0px'
  }

  syncState(isVisible)
  button.onclick = onClick

  return {
    button,
    syncState,
  }
}
