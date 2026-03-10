const CURRENT_LOCATION_ICON_SRC = new URL('../../../assets/icons/CurrentLocationIcon.svg', import.meta.url).href

export function createLocateControlButton(onClick: () => void) {
  const button = document.createElement('button')
  button.type = 'button'
  button.title = 'Go to current location'
  button.className = 'map-control-locate'
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

  const icon = document.createElement('img')
  icon.src = CURRENT_LOCATION_ICON_SRC
  icon.alt = 'Current location'
  icon.width = 20
  icon.height = 20
  icon.style.pointerEvents = 'none'
  button.appendChild(icon)

  button.onclick = onClick
  return button
}
