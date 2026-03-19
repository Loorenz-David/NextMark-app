import { BasicButton } from '@/shared/buttons/BasicButton'
import type { LabelDefinition } from '@/shared/inputs/LabelPicker/labelTypes'

type EmailLabelsPanelProps = {
  labels: LabelDefinition[]
  activeRegion: 'header' | 'body' | null
  onSelect: (label: LabelDefinition) => void
}

export const EmailLabelsPanel = ({
  labels,
  activeRegion,
  onSelect,
}: EmailLabelsPanelProps) => {
  const resolvedRegion = activeRegion ?? 'body'

  return (
    <aside className="admin-glass-panel-strong rounded-[26px] p-5 shadow-none">
      <div className="rounded-[18px] border border-[#83ccb9]/12 bg-[linear-gradient(135deg,rgba(131,204,185,0.08),rgba(94,209,215,0.04))] px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-[#83ccb9]/28 bg-[#83ccb9]/16 px-1.5 text-[0.7rem] font-semibold text-[#a7f0de]">
            +
          </span>
          <span className="font-medium">Click a label to insert it into the active email region.</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Labels
        </p>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">Insert dynamic values</h3>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Focus the email header or body on the left, then use these placeholders to personalize
          the template.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
          Inserting into
        </span>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${
            resolvedRegion === 'header'
              ? 'border-[#67cfc9]/45 bg-[#67cfc9]/14 text-[#9be9d7]'
              : 'border-white/[0.08] bg-white/[0.04] text-[var(--color-muted)]'
          }`}
        >
          Header
        </span>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${
            resolvedRegion === 'body'
              ? 'border-[#67cfc9]/45 bg-[#67cfc9]/14 text-[#9be9d7]'
              : 'border-white/[0.08] bg-white/[0.04] text-[var(--color-muted)]'
          }`}
        >
          Body
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {labels.map((label) => (
          <BasicButton
            key={label.id}
            params={{
              variant: 'secondary',
              onClick: () => onSelect(label),
              className: 'px-3 py-1.5 text-xs',
              ariaLabel: `Insert ${label.displayName}`,
            }}
          >
            {label.displayName}
          </BasicButton>
        ))}
      </div>
    </aside>
  )
}
