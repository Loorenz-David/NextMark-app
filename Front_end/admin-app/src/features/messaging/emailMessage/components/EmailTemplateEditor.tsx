import type { EmailTemplateValue } from '../types'
import { EmailBodyEditor } from './EmailBodyEditor'
import { EmailFooterEditor } from './EmailFooterEditor'
import { EmailHeaderEditor } from './EmailHeaderEditor'

type EmailTemplateEditorProps = {
  value: EmailTemplateValue
  onChange: (value: EmailTemplateValue) => void
}

export const EmailTemplateEditor = ({ value, onChange }: EmailTemplateEditorProps) => {
  
  return (
    <div className="mx-auto flex w-full max-w-4xl p-4 flex-col gap-6 ">
        <div className="mx-auto w-full max-w-3xl rounded-xl border border-[var(--color-border)]/80 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[var(--color-border)]/70 bg-[var(--color-muted)]/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Email Template Canvas
          </div>

         <div className="flex flex-col gap-6 p-4 md:p-6">
            <section className="rounded-lg border  border-[var(--color-border)]/70 bg-[var(--color-page)] p-4 shadow-sm">
               <EmailHeaderEditor
                        value={value.header}
                        onChange={(header) => onChange({ ...value, header })}
                      />
            </section>

            <section className="min-h-[260px] rounded-lg border border-[var(--color-border)]/70 bg-white p-4 shadow-sm">
              <EmailBodyEditor
                          value={value.body}
                          onChange={(body) => onChange({ ...value, body })}
                        />
            </section>

            <section className="rounded-lg border border-[var(--color-border)]/70 bg-[var(--color-page)] p-4 shadow-sm">
              <EmailFooterEditor
                          buttons={value.footerButtons}
                          onChange={(footerButtons) => onChange({ ...value, footerButtons })}
                        />
            </section>
          </div> 
        </div>

    </div>
  )
}


