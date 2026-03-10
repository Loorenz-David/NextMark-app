import type { ReactNode } from 'react'

import { BasicButton } from '@/shared/buttons/BasicButton'
import { SearchBar } from '@/shared/buttons/SearchBar'

type ItemSectionLayoutProps = {
  title: string
  description: string
  onCreate: () => void
  query?: string
  onSearch?: (value: string) => void
  showSearch?: boolean
  bodyClassName?: string
  children: ReactNode
}

export const ItemSectionLayout = ({
  title,
  description,
  onCreate,
  query,
  onSearch,
  showSearch = true,
  bodyClassName,
  children,
}: ItemSectionLayoutProps) => (
  <section className="flex h-full flex-col">
    <div className="flex flex-col shadow-md p-4 gap-8 pb-5 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="text-xs text-[var(--color-muted)]">{description}</p>
        </div>
        <BasicButton params={{ 
          onClick: onCreate ,
          variant:'primary'
          }}>
          Create
        </BasicButton>
      </div>
      {showSearch && onSearch ? (
        <SearchBar
          onChange={(value) => onSearch(value.input ?? '')}
          className="w-full rounded-full border border-[var(--color-muted)]/40 px-3 py-2 text-sm"
          placeholder={"search"}
        />
      ) : null}
    </div>


    <div
      className={
        bodyClassName ?? 'flex flex-col gap-4 bg-[var(--color-muted)]/15 h-full p-2 pt-8 px-4'
      }
    >
      {children}
    </div>
  </section>
)
