import { BasicButton } from '@/shared/buttons/BasicButton'
import { Switch } from '@/shared/inputs/Switch'

import { useEmailMessageContext } from '../context/useEmailMessageContext'
import { EmailTemplateEditor } from '../components/EmailTemplateEditor'

export const EmailTemplateEditorPage = () => {
  const {
    activeTrigger,
    setActiveTrigger,
    enabled,
    permission,
    setPermission,
    setEnabled,
    value,
    setValue,
    saveTemplate,
  } = useEmailMessageContext()

  if (!activeTrigger) {
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
        <BasicButton
          params={{
            variant: 'secondary',
            onClick: () => setActiveTrigger(null),
            className: 'px-3 py-1 text-xs',
            ariaLabel: 'Back to templates list',
          }}
        >
          Back
        </BasicButton>
        <div className="flex items-end gap-12">
          <div className="flex flex-col gap-1">
              <span className="text-sm">Ask for permission:</span>
              <Switch
                value={ permission }
                onChange={ setPermission }
              />
          </div>
          <div className="flex flex-col  gap-1">
            <span className="text-xs text-[var(--color-muted)]">Enabled</span>
            <Switch value={enabled} onChange={setEnabled}  />
          </div>
           <BasicButton
              params={{
                variant: 'primary',
                onClick: () => saveTemplate(),
                className: 'px-4 py-2 text-md',
                ariaLabel: 'Save template',
              }}
            >
              Save
            </BasicButton>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin p-6">
        <h2 className="text-base font-semibold text-[var(--color-text)]">{activeTrigger.label}</h2>
        <p className="text-sm text-[var(--color-muted)]">{activeTrigger.description}</p>

      
        <EmailTemplateEditor value={value} onChange={setValue} />
      </div>
    </div>
  )
}
