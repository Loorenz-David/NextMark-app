import type { MapOrder } from '../domain/entities/MapOrder'
import type { MapMarkerOperationDirection } from '../domain/entities/MapOrder'

const CONTENT_CLASS = 'map-marker__content'
const BADGES_CLASS = 'map-marker__operation-badges'

const addClassTokens = (el: HTMLElement, className?: string | null) => {
  if (!className) return
  const tokens = className.split(/\s+/).filter(Boolean)
  if (!tokens.length) return
  el.classList.add(...tokens)
}

const ensureMarkerContentElement = (el: HTMLElement): HTMLElement => {
  const existing = el.querySelector(`.${CONTENT_CLASS}`) as HTMLElement | null
  if (existing) return existing

  const content = document.createElement('span')
  content.className = CONTENT_CLASS
  el.appendChild(content)
  return content
}

export function applyMarkerContent(el: HTMLElement, label?: string) {
  const content = ensureMarkerContentElement(el)
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

export function applyOperationBadges(
  el: HTMLElement,
  directions?: MapMarkerOperationDirection[],
) {
  const previous = el.querySelector(`.${BADGES_CLASS}`)
  if (previous) {
    previous.remove()
  }

  if (!directions?.length) {
    return
  }

  const badges = document.createElement('span')
  badges.className = BADGES_CLASS

  directions.forEach((direction) => {
    const badge = document.createElement('span')
    badge.className = `map-marker__operation-badge map-marker__operation-badge--${direction}`
    badges.appendChild(badge)
  })

  el.appendChild(badges)
}

export function createMarkerElement(order: MapOrder) {
  const el = document.createElement('div')

  if (order.markerColor) {
    el.style.setProperty('--marker-bg', order.markerColor)
  } else {
    el.style.removeProperty('--marker-bg')
  }

  const interactionVariant = order.interactionVariant ?? 'default'
  el.className = 'map-marker'
  el.dataset.markerVariant = interactionVariant
  el.classList.add(`map-marker--variant-${interactionVariant}`)

  if (order.status) {
    el.classList.add(`${order.status}-marker`)
  }

  if (order.className) {
    addClassTokens(el, order.className)
  }

  applyMarkerContent(el, order.label)
  applyOperationBadges(el, order.operationBadgeDirections)

  return el
}
