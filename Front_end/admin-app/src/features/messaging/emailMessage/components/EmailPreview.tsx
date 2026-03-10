import { BasicButton } from '@/shared/buttons/BasicButton'

type EmailPreviewProps = {
  html: string
  isLoading: boolean
  onRefresh: () => void
}

export const EmailPreview = ({ html, isLoading, onRefresh }: EmailPreviewProps) => (
  <section className="flex min-h-[360px] flex-col gap-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">Preview</h3>
      <BasicButton
        params={{
          variant: 'secondary',
          className: 'px-3 py-1 text-xs',
          onClick: onRefresh,
          disabled: isLoading,
          ariaLabel: 'Refresh email preview',
        }}
      >
        {isLoading ? 'Loading...' : 'Refresh preview'}
      </BasicButton>
    </div>
    <div className="h-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
      <iframe
        title="Email template preview"
        srcDoc={html}
        className="h-[420px] w-full"
      />
    </div>
  </section>
)
