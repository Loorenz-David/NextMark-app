import { CheckMarkIcon, ThunderIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { DropdownButton } from '@/shared/buttons/DropdownButton'

import { useLocalDeliveryCommands, useLocalDeliveryState } from '../context/useLocalDeliveryContext'

type Props = {
  className?: string
  borderColor?:string
}

export const RouteOptimizationDropdownButton = ({
  className,
  borderColor,
}: Props) => {
  const {
    routeSolutionsOrdered,
    bestRouteSolutionId,
    isSelectedSolutionOptimized,
  } = useLocalDeliveryState()
  const {
    localDeliveryActions,
  } = useLocalDeliveryCommands()

  const primaryLabel = isSelectedSolutionOptimized ? 'Update optimization' : 'Optimize route'

  return (
    <DropdownButton
      className={className}
      borderColor={borderColor}
      fullWidth
      label={
        <div className="flex gap-2 items-center w-full py-1 justify-center">
          <ThunderIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm text-blue-500">{primaryLabel}</span>
        </div>
      }

      variant="secondary"
      onClick={localDeliveryActions.optimizeRoute}
    >
      <div className="w-full">
        <div className="max-h-[300px] overflow-y-auto scroll-thin">
          {routeSolutionsOrdered.length ? (
            routeSolutionsOrdered.map((solution, index) => {
              const label = solution.label || `variant ${index + 1}`
              const isSelected = solution.is_selected
              const isBest = solution.id === bestRouteSolutionId
              return (
                <button
                  key={solution.client_id}
                  type="button"
                  className="w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-[var(--color-muted)]/10"
                  onClick={() => solution.id && localDeliveryActions.selectRouteSolution(solution.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-left">{label}</span>
                    {isBest ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-muted)]/20 text-[var(--color-muted)]">
                        Best
                      </span>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <CheckMarkIcon className="h-4 w-4" />
                  ) : null}
                </button>
              )
            })
          ) : (
            <div className="px-2 py-2 text-sm text-[var(--color-muted)]">
              No route variants yet.
            </div>
          )}
        </div>

        {isSelectedSolutionOptimized ? (
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: localDeliveryActions.reOptimizeRoute,
                className: 'w-full',
              }}
            >
              Re-optimize
            </BasicButton>
          </div>
        ) : null}
      </div>
    </DropdownButton>
  )
}
