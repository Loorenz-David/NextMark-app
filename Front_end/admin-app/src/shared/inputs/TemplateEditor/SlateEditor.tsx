import type { Descendant } from 'slate'
import { Editable, Slate } from 'slate-react'
import type { RenderElementProps } from 'slate-react'
import type { BaseEditor } from 'slate'

import type { KeyboardEvent, JSX } from 'react'

import type { ReactEditor } from 'slate-react'

type SlateEditorProps = {
  editor: BaseEditor & ReactEditor
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  placeholder?: string
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
}

export const SlateEditor = ({ editor, value, onChange, renderElement, placeholder, onKeyDown }: SlateEditorProps) => (
  <Slate editor={editor} initialValue={value} onChange={onChange}>
    <Editable
      className=" slate-editor min-h-[140px] rounded-lg border border-[var(--color-muted)]/30 bg-white px-3  text-sm text-[var(--color-text)] focus:outline-none"
      renderElement={renderElement}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
    />
  </Slate>
)
