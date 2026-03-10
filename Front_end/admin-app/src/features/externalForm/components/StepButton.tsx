type StepButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

export const StepButton = ({
  label,
  onClick,
  disabled = false,
  type = 'button',
}: StepButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  )
}
