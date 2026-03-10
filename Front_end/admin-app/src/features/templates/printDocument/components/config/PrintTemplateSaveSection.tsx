import { BasicButton } from '@/shared/buttons/BasicButton'

type PrintTemplateSaveSectionProps = {
  isExisting: boolean
  onSave: () => void
}

export const PrintTemplateSaveSection = ({ isExisting, onSave }: PrintTemplateSaveSectionProps) => (
  <div className="mt-4 flex justify-end items-end gap-6">
    <BasicButton
      params={{
        variant: 'primary',
        className: 'py-2 px-3',
        onClick: onSave,
        ariaLabel: isExisting ? 'Save template' : 'Create template',
      }}
    >
      {isExisting ? 'Save' : 'Create'}
    </BasicButton>
  </div>
)
