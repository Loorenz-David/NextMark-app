import type { StopDetailInfoRowDisplay } from '../../domain/stopDetailDisplay.types'
import { StopDetailInfoRow } from './StopDetailInfoRow'

type StopDetailBodyProps = {
  rows: StopDetailInfoRowDisplay[]
}

export function StopDetailBody({ rows }: StopDetailBodyProps) {
  return (
    <section className="space-y-3 px-5 pb-6 pt-2">
      {rows.map((row) => (
        <StopDetailInfoRow
          key={row.id}
          row={row}
        />
      ))}
    </section>
  )
}
