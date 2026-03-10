import { fieldInput, fieldContainer } from '@/constants/classes'
import { BasicButton } from '@/shared/buttons/BasicButton'



type OrderCaseChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export const OrderCaseChatComposer = ({
  value,
  onChange,
  onSend,
  disabled = false,
}: OrderCaseChatComposerProps) => {


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }


  return (
    <div className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-page)] pt-3">
      <div className="flex-1">
        <div className={fieldContainer}>
          <textarea
            value={value}
            onChange={(event)=> onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            className={fieldInput}
            rows={2}
          />

        </div>
      </div>
      <BasicButton
        params={{
          variant: 'primary',
          onClick: onSend,
          disabled,
          ariaLabel: 'Send case message',
        }}
      >
        Send
      </BasicButton>
    </div>
  )
}
