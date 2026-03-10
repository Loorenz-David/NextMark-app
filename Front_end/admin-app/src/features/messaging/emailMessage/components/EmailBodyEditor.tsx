import type { Descendant } from 'slate'

import { TemplateEditor } from '@/shared/inputs/TemplateEditor/TemplateEditor'
import { allowedLabels } from '../config/emailLabelConfig'

type EmailBodyEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
}

export const EmailBodyEditor = ({ value, onChange }: EmailBodyEditorProps) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-sm font-semibold text-[var(--color-text)]">Body</h3>
    <TemplateEditor
      allowedLabels={allowedLabels}
      value={value}
      onChange={onChange}
      placeholder="Write your email message..."
    />
  </section>
)
