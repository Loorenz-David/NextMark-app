
import { BasicButton } from '@/shared/buttons/BasicButton'

import type { IntegrationDefinition } from '../types/integration'
import { ICONS } from '../constants/Icons'

type IntegrationCardProps = {
  definition: IntegrationDefinition
  isActive: boolean
  onAdd: () => void
  onEdit: () => void
  onRemove: () => void
}



export const IntegrationCard = ({
  definition,
  isActive,
  onAdd,
  onEdit,
  onRemove,
}: IntegrationCardProps) => {
  const Icon = ICONS[definition.iconKey]

  return (
    <div className="flex h-100 w-72 min-w-72 flex-col rounded-xl border border-[var(--color-muted)]/30 bg-white p-4 shadow-sm">
      
      <div className="flex flex-col  gap-4">
        <div className="flex">
          <div className="flex h-10 w-full items-center justify-between rounded-lg">
            <Icon.icon className={`${Icon.size} text-[var(--color-text)]`} />
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : null}
          </div>
          
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{definition.name}</p>
          <p className="text-xs text-[var(--color-muted)]">{definition.description}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-1 items-center justify-center text-xs text-[var(--color-muted)]">
        Status details coming soon.
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 w-full">
        {!isActive ? (
          <BasicButton params={{ 
            onClick: onAdd,
            variant:'secondary',
            className:"w-full"
            }}>
            Add
          </BasicButton>
        ) : (
          <>
            <BasicButton params={{ 
              onClick: onEdit,
              variant:'primary',
              className:"w-full"
            }}>
              Edit
            </BasicButton>
            <BasicButton params={{ 
              onClick: onRemove, 
              variant:'secondary',
              className:"w-full"
            }}>
              Remove
            </BasicButton>
          </>
        )}
      </div>
    </div>
  )
}
