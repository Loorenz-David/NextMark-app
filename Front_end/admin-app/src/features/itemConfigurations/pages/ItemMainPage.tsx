import { useMemo, useState } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'

import { ItemProvider } from '../context/ItemProvider'
import { ItemTypesPage } from './ItemTypesPage'
import { ItemPropertiesPage } from './ItemPropertiesPage'
import { ItemPositionsPage } from './ItemPositionsPage'
import { ItemStatesPage } from './ItemStatesPage'

type ItemTabKey = 'types' | 'properties' | 'positions' | 'states'

const TABS: { key: ItemTabKey; label: string }[] = [
  { key: 'types', label: 'Types' },
  { key: 'properties', label: 'Properties' },
  { key: 'positions', label: 'Positions' },
  { key: 'states', label: 'States' },
]

const ItemMainContent = () => {
  const [activeTab, setActiveTab] = useState<ItemTabKey>('types')

  const content = useMemo(() => {
    switch (activeTab) {
      case 'properties':
        return <ItemPropertiesPage />
      case 'positions':
        return <ItemPositionsPage />
      case 'states':
        return <ItemStatesPage />
      case 'types':
      default:
        return <ItemTypesPage />
    }
  }, [activeTab])

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex gap-4 p-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              activeTab === tab.key
                ? 'bg-[var(--color-blue-500)] text-white'
                : 'bg-[var(--color-muted)]/10 text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 ">
        {content}
      </div>
    </div>
  )
}

export const ItemMainPage = (_: StackComponentProps<undefined>) => (
  <ItemProvider>
    <ItemMainContent />
  </ItemProvider>
)
