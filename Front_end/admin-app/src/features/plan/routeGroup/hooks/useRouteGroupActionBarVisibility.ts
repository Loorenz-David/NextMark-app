import { useScrollHideActionBar } from '@/shared/hooks/useScrollHideActionBar'

type UseRouteGroupActionBarVisibilityParams = {
  enabled?: boolean
  expandedHeight: number
  collapsedHeight?: number
}

export const useRouteGroupActionBarVisibility = ({
  enabled = true,
  expandedHeight,
  collapsedHeight = 10,
}: UseRouteGroupActionBarVisibilityParams) => {
  return useScrollHideActionBar({
    enabled,
    expandedHeight,
    collapsedHeight,
  })
}
