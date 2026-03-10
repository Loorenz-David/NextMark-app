import { PlanMainHeader } from '../components'
import { usePlanHeaderAction } from '../actions/usePlanActions'
import { PlanPage } from '../pages/Plan.page'
import type { DesktopPlanViewMode } from '@/features/home/hooks/useHomeDesktopLayout'
import { PlanDesktopTimeline } from './PlanDesktopTimeline'

type PlanDesktopShellProps = {
  onRequestClose?: () => void
  showCloseButton?: boolean
  className?: string
  viewMode?: DesktopPlanViewMode
}

export const PlanDesktopShell = ({
  onRequestClose,
  showCloseButton = true,
  className,
  viewMode = 'rail',
}: PlanDesktopShellProps) => {
  const planActions = usePlanHeaderAction()
  

  if (viewMode === 'split') {
    return (
      <PlanDesktopTimeline/>
    )
  }

  return (
        <PlanPage 
          onRequestClose={onRequestClose}
          showCloseButton={showCloseButton}
        />
  )
}
