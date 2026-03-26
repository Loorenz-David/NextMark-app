import { RouteGroupRail, RouteGroupsPageHeader, type RouteGroupRailItem } from '../components'
import { useRouteGroupRailController } from '../controllers/useRouteGroupRail.controller'
import { RouteGroupPageProvider } from '../providers/RouteGroupPageProvider'
import { useRouteGroupPageContext } from '../context/useRouteGroupPageContext'
import { RouteGroupsPageContent } from './RouteGroupsPageContent.page'

type PlanOrdersPagePayload = {
  planId?: number
  freshAfter?: string | null
}

type RouteGroupsPageProps = {
  payload: PlanOrdersPagePayload
  onRequestClose?: () => void
}

const MOCK_ROUTE_GROUPS: RouteGroupRailItem[] = [
  { route_group_id: 1, label: 'Route 1' },
  { route_group_id: 2, label: 'Route 2' },
  { route_group_id: 3, label: 'Route 3' },
  { route_group_id: 4, label: 'Route 4' },
]

type RouteGroupsPageLayoutProps = {
  header: React.ReactNode
  routeGroups: RouteGroupRailItem[]
  onRouteGroupClick: (item: RouteGroupRailItem) => void
  showOptimizeRow: boolean
}

export const RouteGroupsPageLayout = ({
  header,
  routeGroups,
  onRouteGroupClick,
  showOptimizeRow,
}: RouteGroupsPageLayoutProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-primary)]/5 md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        {header}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="border-b border-white/8 md:h-full md:border-b-0 md:border-r md:border-white/8">
            <RouteGroupRail
              items={routeGroups}
              onClick={onRouteGroupClick}
            />
          </div>
          <div className="min-h-0 flex-1">
            <RouteGroupsPageContent showOptimizeRow={showOptimizeRow} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const RouteGroupsPage = ({ payload, onRequestClose }: RouteGroupsPageProps) => {
  const planId = payload?.planId ?? null

  if (planId == null) return null

  return (
    <RouteGroupPageProvider planId={planId} freshAfter={payload?.freshAfter ?? null}>
      <RouteGroupsPageScreen
        planId={planId}
        onRequestClose={onRequestClose}
      />
    </RouteGroupPageProvider>
  )
}

type RouteGroupsPageScreenProps = {
  planId: number
  onRequestClose?: () => void
}

const RouteGroupsPageScreen = ({
  planId,
  onRequestClose,
}: RouteGroupsPageScreenProps) => {
  const { orderCount, routeGroup, selectedRouteSolution } = useRouteGroupPageContext()
  const { railItems, handleRouteGroupClick } = useRouteGroupRailController(planId)

  const isLoading = routeGroup?.is_loading
  const showOptimizeRow =
    !isLoading &&
    orderCount > 0 &&
    (selectedRouteSolution?.is_optimized === 'not optimize'
      || selectedRouteSolution?.has_route_warnings === true)

  return (
    <RouteGroupsPageLayout
      header={(
        <RouteGroupsPageHeader
          onRequestClose={onRequestClose}
        />
      )}
      routeGroups={railItems.length > 0 ? railItems : MOCK_ROUTE_GROUPS}
      onRouteGroupClick={handleRouteGroupClick}
      showOptimizeRow={showOptimizeRow}
    />
  )
}
