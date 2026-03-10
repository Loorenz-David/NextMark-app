export function createLocateControlContainer(button: HTMLButtonElement) {
  const container = document.createElement('div')
  container.style.padding = '8px'
  container.appendChild(button)
  return container
}
