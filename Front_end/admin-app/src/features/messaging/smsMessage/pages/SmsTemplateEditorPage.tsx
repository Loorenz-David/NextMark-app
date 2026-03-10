import { BasicButton } from '@/shared/buttons/BasicButton'
import { Switch } from '@/shared/inputs/Switch'

import { SmsTemplateEditor } from '../components/SmsTemplateEditor'
import { useSmsMessageContext } from '../context/useSmsMessageContext'

export const SmsTemplateEditorPage = () => {
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
  } = useSmsMessageContext()

  if (!activeTrigger) {
    return null
  }
 
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
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
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text)]">{activeTrigger.label}</h2>
        <p className="text-sm text-[var(--color-muted)]">{activeTrigger.description}</p>
      </div>
      <SmsTemplateEditor value={value} onChange={setValue} />
    </div>
  )
}
