import { renderSlateBlocks } from './renderSlateContent'
import type { StepCardProps } from './CustomInstructions.types'

export const StepCard = ({ step, index, className, maxWidth }: StepCardProps) => {
  const containerClassName =
    `flex min-w-[280px] flex-1 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className ?? ''}`.trim()

  return (
    <article className={containerClassName} style={{ maxWidth: maxWidth }}>
      <header className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {index + 1}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          {renderSlateBlocks(step.header, `step-${index}-header`)}
        </div>
      </header>

      <section className="flex flex-col gap-2 border-t border-slate-200 pt-3">
        {renderSlateBlocks(step.body, `step-${index}-body`)}
      </section>
    </article>
  )
}
