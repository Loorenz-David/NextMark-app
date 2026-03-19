import type { StopDetailInfoRowDisplay, StopDetailOrderNoteCardDisplay } from '../../domain/stopDetailDisplay.types'
import { StopDetailInfoRow } from './StopDetailInfoRow'

type StopDetailBodyProps = {
  rows: StopDetailInfoRowDisplay[]
  orderNoteCard?: StopDetailOrderNoteCardDisplay | null
}

function OrderNoteCard({ card }: { card: StopDetailOrderNoteCardDisplay }) {
  const content = (
    <div className="rounded-2xl border border-yellow-400/50 bg-yellow-400/15 px-4 py-3">
      <p className="text-sm font-medium text-yellow-300">{card.firstNote}</p>
    </div>
  )

  if (card.onPress) {
    return (
      <button
        className="flex w-full items-center gap-2 text-left"
        onClick={card.onPress}
        type="button"
      >
        <div className="flex-1 rounded-2xl border border-yellow-400/50 bg-yellow-400/15 px-4 py-3">
          <p className="text-sm font-medium text-yellow-300">{card.firstNote}</p>
        </div>
        <svg aria-hidden="true" className="h-5 w-5 shrink-0 font-bold text-yellow-300" fill="none" viewBox="0 0 24 24">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      </button>
    )
  }

  return content
}

export function StopDetailBody({ rows, orderNoteCard }: StopDetailBodyProps) {
  return (
    <section className="space-y-3 px-5 pb-6 pt-2">
      {orderNoteCard ? <OrderNoteCard card={orderNoteCard} /> : null}
      {rows.map((row) => (
        <StopDetailInfoRow
          key={row.id}
          row={row}
        />
      ))}
    </section>
  )
}
