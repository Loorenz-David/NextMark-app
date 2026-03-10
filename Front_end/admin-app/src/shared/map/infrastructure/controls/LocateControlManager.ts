import { createLocateControlButton } from '../../presentation/mapLocateControlButton.factory'
import { createLocateControlContainer } from '../../presentation/mapLocateControlContainer.factory'
import type { MapInstanceManager } from '../core/MapInstanceManager'
import type { UserLocationManager } from '../location/UserLocationManager'

export class LocateControlManager {
  private locateControlContainer: HTMLElement | null = null
  private locateControlButton: HTMLButtonElement | null = null
  private mapInstanceManager: MapInstanceManager
  private userLocationManager: UserLocationManager

  constructor(mapInstanceManager: MapInstanceManager, userLocationManager: UserLocationManager) {
    this.mapInstanceManager = mapInstanceManager
    this.userLocationManager = userLocationManager
  }

  mountLocateControl() {
    const map = this.mapInstanceManager.getMap()
    if (!map) {
      return
    }

    const button = createLocateControlButton(() => {
      void this.userLocationManager.resolveCurrentPosition().then((coordinates) => {
        if (!coordinates || !this.mapInstanceManager.getMap()) {
          return
        }

        this.userLocationManager.upsertUserLocationMarker(coordinates)
        this.mapInstanceManager.getMap()?.setOptions({
          center: coordinates,
          zoom: 14,
        })
      })
    })

    const container = createLocateControlContainer(button)
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(container)
    this.locateControlContainer = container
    this.locateControlButton = button
  }

  unmountLocateControl() {
    const map = this.mapInstanceManager.getMap()

    if (!this.locateControlContainer || !map) {
      this.locateControlContainer = null
      this.locateControlButton = null
      return
    }

    if (this.locateControlButton) {
      this.locateControlButton.onclick = null
    }

    const controlArray = map.controls[google.maps.ControlPosition.RIGHT_BOTTOM]
    const index = controlArray?.getArray().indexOf(this.locateControlContainer) ?? -1
    if (controlArray && index > -1) {
      controlArray.removeAt(index)
    } else if (this.locateControlContainer.parentElement) {
      this.locateControlContainer.remove()
    }

    this.locateControlContainer = null
    this.locateControlButton = null
  }
}
