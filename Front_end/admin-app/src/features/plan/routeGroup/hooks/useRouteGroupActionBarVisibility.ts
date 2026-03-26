import { useScrollHideActionBar } from '@/shared/hooks/useScrollHideActionBar'

type UseLocalDeliveryActionBarVisibilityParams = {
  enabled?: boolean
  expandedHeight: number
  collapsedHeight?: number
}

export const useRouteGroupActionBarVisibility = ({
  enabled = true,
  expandedHeight,
  collapsedHeight = 10,
}: UseLocalDeliveryActionBarVisibilityParams) => {
  return useScrollHideActionBar({
    enabled,
    expandedHeight,
    collapsedHeight,
  })
}
