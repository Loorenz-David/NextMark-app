import type { Descendant } from 'slate'

import { TemplateEditor } from '@/shared/inputs/TemplateEditor/TemplateEditor'
import { allowedLabels } from '../config/emailLabelConfig'

type EmailHeaderEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
}

export const EmailHeaderEditor = ({ value, onChange }: EmailHeaderEditorProps) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-sm font-semibold text-[var(--color-text)]">Header</h3>
    <TemplateEditor
      allowedLabels={allowedLabels}
      value={value}
      onChange={onChange}
      placeholder="Email headline or greeting"
      
      singleLine
    />
  </section>
)
