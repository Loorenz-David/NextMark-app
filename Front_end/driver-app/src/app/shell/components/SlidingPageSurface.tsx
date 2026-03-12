import { useMemo, useSyncExternalStore } from 'react'
import { CloseIcon } from '@/assets/icons'
import { useDriverAppShell } from '../providers/driverAppShell.context'
import { selectSlidingPageState } from '../stores/shell.selectors'

function TestSlidingPage({
  onClose,
  title,
}: {
  title: string
  onClose: () => void
}) {
  return (
    <div className="driver-sliding-page-surface__panel-content">
      <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white">{title}</h2>
        </div>

        <button
          aria-label="Close sliding page"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white"
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1" />
    </div>
  )
}

export function SlidingPageSurface() {
  const { store, closeSlidingPage } = useDriverAppShell()
  const shellState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  )
  const slidingPageState = useMemo(() => selectSlidingPageState(shellState), [shellState])

  return (
    <section className={`driver-sliding-page-surface${slidingPageState.isOpen ? ' is-open' : ''}`}>
      <button
        aria-label="Close sliding page"
        className="driver-sliding-page-surface__backdrop"
        onClick={closeSlidingPage}
        type="button"
      />

      <div className="driver-sliding-page-surface__panel">
        {slidingPageState.currentPage?.page === 'test-sliding-page' ? (
          <TestSlidingPage
            onClose={closeSlidingPage}
            title={slidingPageState.currentPage.params.title}
          />
        ) : null}
      </div>
    </section>
  )
}
