import { useAssignedRouteController } from '../controllers/useAssignedRouteController.controller'
import { useAssignedRouteToolbarController } from '../controllers/useAssignedRouteToolbar.controller'
import { AssignedRouteEmptyBody } from '../components/AssignedRouteEmptyBody'
import { AssignedRouteFooterAction } from '../components/AssignedRouteFooterAction'
import { AssignedRouteSummaryHeader } from '../components/AssignedRouteSummaryHeader'
import { AssignedRouteTimelineSurface } from '../components/AssignedRouteTimelineSurface'
import { AssignedRouteToolbar } from '../components/AssignedRouteToolbar'

export function AssignedRoutePage() {
  const controller = useAssignedRouteController()
  const toolbarController = useAssignedRouteToolbarController()

  if (!controller.workspace) {
    return null
  }

  return (
    <section className="flex h-full min-h-0 flex-col">
      <AssignedRouteToolbar
        isOverflowMenuOpen={toolbarController.isOverflowMenuOpen}
        isSideMenuOpen={toolbarController.isSideMenuOpen}
        onCloseOverflowMenu={toolbarController.onCloseOverflowMenu}
        onOpenOverflowMenu={toolbarController.onOpenOverflowMenu}
        onOpenSideMenu={toolbarController.onOpenSideMenu}
        onSearchValueChange={toolbarController.onSearchValueChange}
        searchValue={toolbarController.searchValue}
        showEmbeddedMenuButton={toolbarController.showEmbeddedMenuButton}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain ">
        {controller.pageDisplay.state === 'ready' && controller.pageDisplay.summary && controller.pageDisplay.timeline ? (
          <>
            {controller.pageDisplay.timeline.stops.length > 0 ? (
              <div className="flex min-h-full flex-col">
                <AssignedRouteSummaryHeader summary={controller.pageDisplay.summary} />
                <AssignedRouteTimelineSurface
                  onOpenStopDetail={controller.openStopDetail}
                  timeline={controller.pageDisplay.timeline}
                />
                <AssignedRouteFooterAction label={controller.pageDisplay.footerLabel} />
              </div>
            ) : (
              <div className="flex min-h-full flex-col">
                <AssignedRouteEmptyBody />
                <AssignedRouteFooterAction
                  label={'Add stop'}
                  placement="bottom-fixed"
                />
              </div>
            )}
          </>
        ) : controller.pageDisplay.state === 'loading' ? (
          <div className="px-5 py-8 text-sm text-white/65">
            Loading route...
          </div>
        ) : (
          <div className="px-5 py-8 text-sm text-white/65">
            {controller.pageDisplay.emptyMessage ?? 'No route selected.'}
          </div>
        )}
      </div>
    </section>
  )
}
