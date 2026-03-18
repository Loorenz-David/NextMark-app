import type { ReactNode } from 'react'

type Props = { children: ReactNode }

export const StepLayout = ({ children }: Props) => (
  <section className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
    {children}
  </section>
)
