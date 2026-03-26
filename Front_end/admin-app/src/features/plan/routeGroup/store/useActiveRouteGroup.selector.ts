import { clearActiveRouteGroupSelection, selectActiveRouteGroupId, setActiveRouteGroupId, useActiveRouteGroupStore } from './activeRouteGroup.store'

export const useActiveRouteGroupId = () => useActiveRouteGroupStore(selectActiveRouteGroupId)

export const useActiveRouteGroupActions = () => ({
  setActiveRouteGroupId,
  clearActiveRouteGroupSelection,
})
