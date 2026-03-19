import type { FocusEvent, JSX, KeyboardEvent } from 'react'

import type { BaseEditor, Descendant } from 'slate'
import type { ReactEditor, RenderElementProps } from 'slate-react'

import { SlateEditor } from '@/shared/inputs/TemplateEditor/SlateEditor'

type EmailEditableRegionProps = {
  sectionLabel: string
  editor: BaseEditor & ReactEditor
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  renderElement: (props: RenderElementProps) => JSX.Element
  placeholder: string
  active: boolean
  onFocus: (event: FocusEvent<HTMLDivElement>) => void
  singleLine?: boolean
  helperText?: string
}

export const EmailEditableRegion = ({
  sectionLabel,
  editor,
  value,
  onChange,
  renderElement,
  placeholder,
  active,
  onFocus,
  singleLine = false,
  helperText,
}: EmailEditableRegionProps) => {
  const sharedEditorClass =
    'border-0 bg-transparent px-0 py-0 shadow-none placeholder:text-black/24'

  const regionClass = active
    ? 'border-[#67cfc9]/42 bg-[#eef4f3] shadow-[0_0_0_2px_rgba(103,207,201,0.12)]'
    : 'border-transparent bg-transparent'

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (singleLine && event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <section className={`border-b border-black/[0.08] px-4 py-4 transition last:border-b-0 md:px-5 ${regionClass}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-black/35">
          {sectionLabel}
        </p>
        {active ? (
          <span className="inline-flex items-center rounded-full border border-[#67cfc9]/40 bg-[#67cfc9]/10 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#2e7f7a]">
            Active
          </span>
        ) : null}
      </div>

      <SlateEditor
        key={JSON.stringify(value)}
        editor={editor}
        value={value}
        onChange={onChange}
        renderElement={renderElement}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className={`${sharedEditorClass} ${
          singleLine
            ? 'min-h-[42px] text-[1rem] font-bold leading-8 text-black/78'
            : 'min-h-[220px] text-[1rem] leading-8 text-black/72'
        }`}
      />

      {helperText ? <p className="mt-3 text-xs leading-5 text-black/42">{helperText}</p> : null}
    </section>
  )
}
