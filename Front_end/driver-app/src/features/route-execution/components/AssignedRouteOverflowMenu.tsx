type AssignedRouteOverflowMenuProps = {
  isOpen: boolean
  onClose: () => void
}

export function AssignedRouteOverflowMenu({
  isOpen,
  onClose,
}: AssignedRouteOverflowMenuProps) {
  if (!isOpen) {
    return null
  }

  return (
    <>
      <button
        aria-label="Close route options"
        className="fixed inset-0 z-10 bg-transparent"
        onClick={onClose}
        type="button"
      />

      <div className="absolute right-0 top-[calc(100%+0.65rem)] z-20 min-w-48 rounded-3xl border border-white/15 bg-[rgba(var(--bg-app-color),0.92)] p-2 shadow-[0_22px_42px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <button
          className="flex min-h-11 w-full items-center rounded-2xl px-3 text-left text-sm text-white/88 transition-colors hover:bg-white/8"
          onClick={onClose}
          type="button"
        >
          Route options
        </button>

        <button
          className="flex min-h-11 w-full items-center rounded-2xl px-3 text-left text-sm text-white/88 transition-colors hover:bg-white/8"
          onClick={onClose}
          type="button"
        >
          More actions
        </button>
      </div>
    </>
  )
}
