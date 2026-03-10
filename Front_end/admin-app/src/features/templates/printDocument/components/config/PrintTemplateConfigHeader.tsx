import { BasicButton } from '@/shared/buttons/BasicButton'
import { Switch } from '@/shared/inputs/Switch'

type PrintTemplateConfigHeaderProps = {
  enabled: boolean
  askPermission: boolean
  onBack: () => void
  onTogglePermission: (next: boolean) => void
  onToggleEnable: (next: boolean) => void
}

export const PrintTemplateConfigHeader = ({
  enabled,
  askPermission,
  onBack,
  onTogglePermission,
  onToggleEnable,
}: PrintTemplateConfigHeaderProps) => (
  <div className="mb-4 flex items-center justify-between items-start gap-3">
    <BasicButton
      params={{
        variant: 'text',
        onClick: onBack,
        ariaLabel: 'Back to channel templates',
      }}
    >
      Back
    </BasicButton>
    <div className="flex gap-12 items-end">
      <div className="flex flex-col gap-2">
        <span className="text-xs">Ask for permission:</span>
        <Switch value={askPermission} onChange={onTogglePermission} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[var(--color-text)]">Template is {enabled ? 'Enabled' : 'Disabled'}</span>
        <Switch value={enabled} onChange={onToggleEnable} />
      </div>
    </div>
  </div>
)
