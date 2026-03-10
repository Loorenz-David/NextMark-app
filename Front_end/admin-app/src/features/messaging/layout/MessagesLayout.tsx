import type { ReactNode } from 'react'

export type MessagesTab<Key extends string = string> = {
  key: Key
  label: string
}

type MessagesLayoutProps<Key extends string> = {
  tabs: MessagesTab<Key>[]
  activeTab: Key
  onTabChange: (key: Key) => void
  children: ReactNode
}

export const MessagesLayout = <Key extends string>({
  tabs,
  activeTab,
  onTabChange,
  children,
}: MessagesLayoutProps<Key>) => (
  <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden">
    <div className="flex shrink-0 gap-4 px-6 pt-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
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
    <div className="flex min-h-0 flex-1 overflow-hidden">{children}</div>
  </div>
)
