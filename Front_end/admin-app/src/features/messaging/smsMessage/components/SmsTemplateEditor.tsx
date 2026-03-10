import type { Descendant } from 'slate'

import { TemplateEditor } from '@/shared/inputs/TemplateEditor/TemplateEditor'
import { allowedLabels } from '../config/smsLabelConfig'

type SmsTemplateEditorProps = {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
}

export const SmsTemplateEditor = ({ value, onChange }: SmsTemplateEditorProps) => (
  <TemplateEditor
    allowedLabels={allowedLabels}
    value={value}
    onChange={onChange}
    placeholder="Write your SMS template..."
    singleLine={true}
  />
)
