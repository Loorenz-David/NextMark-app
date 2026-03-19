import type { FocusEvent, JSX } from 'react'

import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor, RenderElementProps } from 'slate-react'

import { EmailEditableRegion } from './EmailEditableRegion'

type EmailTemplatePreviewCanvasProps = {
  headerEditor: BaseEditor & ReactEditor
  headerValue: Descendant[]
  onHeaderChange: (value: Descendant[]) => void
  bodyEditor: BaseEditor & ReactEditor
  bodyValue: Descendant[]
  onBodyChange: (value: Descendant[]) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  activeRegion: 'header' | 'body' | null
  onHeaderFocus: (event: FocusEvent<HTMLDivElement>) => void
  onBodyFocus: (event: FocusEvent<HTMLDivElement>) => void
  primaryButtonLabel: string
}

export const EmailTemplatePreviewCanvas = ({
  headerEditor,
  headerValue,
  onHeaderChange,
  bodyEditor,
  bodyValue,
  onBodyChange,
  renderElement,
  activeRegion,
  onHeaderFocus,
  onBodyFocus,
  primaryButtonLabel,
}: EmailTemplatePreviewCanvasProps) => {
  return (
    <section className="admin-glass-panel-strong rounded-[26px] p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Live preview
          </p>
          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Responsive email canvas
          </h3>
        </div>
        <span className="inline-flex rounded-full border border-[#83ccb9]/24 bg-[#83ccb9]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#a7f0de]">
          {activeRegion === 'header' ? 'Editing header' : activeRegion === 'body' ? 'Editing body' : 'Body is default'}
        </span>
      </div>

      <div className="mx-auto max-w-[760px] rounded-[30px] border border-black/[0.08] bg-[linear-gradient(180deg,rgba(45,53,54,0.98),rgba(38,45,46,0.98))] shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between border-b border-black/[0.1] px-6 py-5 md:px-8">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-black/35">
              Responsive email
            </p>
            <p className="mt-1 text-sm text-black/46">
              Live desktop and mobile-friendly composition canvas.
            </p>
          </div>
          <span className="rounded-full border border-black/[0.08] bg-black/[0.03] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/42">
            Preview
          </span>
        </div>

        <div className="px-6 py-6 md:px-8 md:py-8">
          <EmailEditableRegion
            sectionLabel="Header"
            editor={headerEditor}
            value={headerValue}
            onChange={onHeaderChange}
            renderElement={renderElement}
            placeholder="Write a short, clear email headline..."
            active={activeRegion === 'header'}
            onFocus={onHeaderFocus}
            singleLine
          />

          <EmailEditableRegion
            sectionLabel="Body"
            editor={bodyEditor}
            value={bodyValue}
            onChange={onBodyChange}
            renderElement={renderElement}
            placeholder="Write the email body here. Use labels to personalize delivery details, tracking information, and client data..."
            active={activeRegion === 'body'}
            onFocus={onBodyFocus}
            helperText="Keep paragraphs short so the email stays readable on both desktop and mobile."
          />
        </div>

        <div className="border-t border-black/[0.1] px-6 py-6 md:px-8">
          <div className="flex flex-col items-start gap-3">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-black/35">
              Primary action
            </p>
            <div
              className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                primaryButtonLabel.trim().length > 0
                  ? 'border-[#67cfc9]/46 bg-[linear-gradient(135deg,rgba(131,204,185,0.84),rgba(92,195,201,0.72))] text-[#112526] shadow-[0_10px_24px_rgba(92,195,201,0.10)]'
                  : 'border-black/[0.08] bg-black/[0.03] text-black/36'
              }`}
            >
              {primaryButtonLabel.trim().length > 0 ? primaryButtonLabel : 'Add primary CTA label on the right'}
            </div>
            <p className="text-xs leading-5 text-black/42">
              The live footer button updates from the CTA settings panel and stays visible in the
              email preview only.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
