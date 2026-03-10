import type { CSSProperties } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'darkBlue' | 'rounded' | 'darkGray' | 'text' | 'textInvers' | 'secondaryInvers' | 'lightBlue'

export const buttonBaseClass =
  'cursor-pointer transition active:scale-[0.98] duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  text: 'bg-[var(--color-page)] border border-[var(--color-border)] hover:bg-[var(--color-accent)] inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]/90',
  textInvers:
    'bg-[var(--color-primary)] border border-[var(--color-page)] hover:bg-[var(--color-primary)]/85 inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-page)]',
  secondaryInvers:
    'bg-[var(--color-primary)] text-[var(--color-page)] border-1 border-[var(--color-page)] hover:bg-[var(--color-accent)] inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium',
  primary:
    'bg-[var(--color-primary)] text-[var(--color-secondary)] hover:bg-[#4a4a4a] inline-flex items-center justify-center rounded-lg px-2 py-1 text-sm font-medium',
  darkGray:
    'bg-[var(--color-muted)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-dark-green)]/70 inline-flex items-center justify-center  px-3 py-1.5 text-sm font-medium',
  darkBlue:
    'bg-[var(--color-dark-blue)] text-[var(--color-primary-foreground)]  hover:bg-[var(--color-dark-blue)]/70 inline-flex items-center justify-center  px-3 py-1.5 text-sm font-medium',
  secondary:
    'bg-[var(--color-secondary)] text-[var(--color-text)] border-1 border-[var(--color-muted)]/30 hover:bg-[var(--color-accent)] inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium',
  rounded:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-sm transition hover:bg-[var(--color-accent)] active:scale-95',
  ghost: 'bg-transparent text-[var(--color-text)] border border-transparent',

  lightBlue:'bg-[var(--color-green-turquess))] text-[var(--color-secondary)]  hover:bg-[var(--color-green-turquess)]/90 inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm'
}

export type ButtonParams = {
  variant?: ButtonVariant
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  style?: CSSProperties
}
