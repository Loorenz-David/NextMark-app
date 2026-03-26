import { create } from 'zustand'

type ActiveRouteGroupState = {
  activeRouteGroupId: number | null
  setActiveRouteGroupId: (routeGroupId: number | null) => void
  clearActiveRouteGroupSelection: () => void
}

export const useActiveRouteGroupStore = create<ActiveRouteGroupState>((set) => ({
  activeRouteGroupId: null,
  setActiveRouteGroupId: (routeGroupId) =>
    set((state) => {
      if (state.activeRouteGroupId === routeGroupId) return state
      return { ...state, activeRouteGroupId: routeGroupId }
    }),
  clearActiveRouteGroupSelection: () =>
    set((state) => {
      if (state.activeRouteGroupId == null) return state
      return { ...state, activeRouteGroupId: null }
    }),
}))

export const selectActiveRouteGroupId = (state: ActiveRouteGroupState) => state.activeRouteGroupId

export const setActiveRouteGroupId = (routeGroupId: number | null) =>
  useActiveRouteGroupStore.getState().setActiveRouteGroupId(routeGroupId)

export const clearActiveRouteGroupSelection = () =>
  useActiveRouteGroupStore.getState().clearActiveRouteGroupSelection()
