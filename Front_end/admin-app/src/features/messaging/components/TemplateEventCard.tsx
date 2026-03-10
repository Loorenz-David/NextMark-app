import type { MouseEventHandler } from 'react'

export type TemplateTriggerCardProps = {
  title: string
  description?: string
  status: string
  onSelect: MouseEventHandler<HTMLDivElement>
}

export const TemplateTriggerCard = ({ title, description, status, onSelect }: TemplateTriggerCardProps) => (
  <div
    role="button"
    onClick={onSelect}
    className="flex w-full h-20 flex-col gap-2 rounded-xl border border-[var(--color-muted)]/40 bg-white p-4 text-left cursor-pointer transition hover:border-[var(--color-muted)]/15 "
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
        <p className="text-xs text-[var(--color-muted)]">{description ?? 'No description.'}</p>
      </div>
      <span className="rounded-full bg-[var(--color-muted)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {status}
      </span>
    </div>
  </div>
)
