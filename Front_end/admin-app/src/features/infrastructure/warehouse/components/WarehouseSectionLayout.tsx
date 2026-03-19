import type { ReactNode } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { SearchBar } from '@/shared/buttons/SearchBar'

type WarehouseSectionLayoutProps = {
  title: string
  description: string
  onCreate: () => void
  query: string
  onSearch: (value: string) => void
  children: ReactNode
}

export const WarehouseSectionLayout = ({
  title,
  description,
  onCreate,
  query,
  onSearch,
  children,
}: WarehouseSectionLayoutProps) => (
  <section className="flex h-full w-full flex-col gap-4 bg-[var(--color-page)] p-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
        <p className="text-xs text-[var(--color-muted)]">{description}</p>
      </div>
      <BasicButton params={{ onClick: onCreate }}>Create</BasicButton>
    </div>

    <SearchBar
      onChange={(value) => onSearch(value.input ?? '')}
      className="w-full"
      inputClassName="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
    />

    <div className="flex flex-col gap-3">
      {children}
    </div>
  </section>
)
