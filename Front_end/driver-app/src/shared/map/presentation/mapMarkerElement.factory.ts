import type { MapMarker } from '../domain/entities/MapMarker'

const CONTENT_CLASS = 'map-marker__content'

const ensureMarkerContentElement = (element: HTMLElement): HTMLElement => {
  const existing = element.querySelector(`.${CONTENT_CLASS}`) as HTMLElement | null
  if (existing) {
    return existing
  }

  const content = document.createElement('span')
  content.className = CONTENT_CLASS
  element.appendChild(content)
  return content
}

export function applyMarkerContent(element: HTMLElement, label?: string) {
  const content = ensureMarkerContentElement(element)
  const nextLabel = label ?? ''
  if (nextLabel) {
    content.textContent = nextLabel
    return
  }

  content.textContent = ''
  const dot = document.createElement('span')
  dot.className = 'map-marker__dot'
  content.appendChild(dot)
}

export function createMarkerElement(mapMarker: MapMarker) {
  const element = document.createElement('div')

  if (mapMarker.markerColor) {
    element.style.setProperty('--marker-bg', mapMarker.markerColor)
  } else {
    element.style.removeProperty('--marker-bg')
  }

  const interactionVariant = mapMarker.interactionVariant ?? 'default'
  element.className = 'map-marker'
  element.dataset.markerVariant = interactionVariant
  element.classList.add(`map-marker--variant-${interactionVariant}`)

  if (mapMarker.status) {
    element.classList.add(`${mapMarker.status}-marker`)
  }

  if (mapMarker.className) {
    element.classList.add(mapMarker.className)
  }

  applyMarkerContent(element, mapMarker.label)
  return element
}
