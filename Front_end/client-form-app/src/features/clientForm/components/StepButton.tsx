import { useClientForm } from '../context/useClientForm'

type Props = {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'ghost'
}

export const StepButton = ({ label, onClick, disabled, variant = 'primary' }: Props) => {
  const { isSubmitting } = useClientForm()
  const isDisabled = disabled || isSubmitting

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'rounded-2xl px-5 py-2.5 text-sm font-medium transition-opacity',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        variant === 'primary'
          ? 'bg-[var(--color-primary)] text-white hover:opacity-90'
          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
