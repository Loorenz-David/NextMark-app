type TemporaryLogoutButtonProps = {
  isDisabled?: boolean
  onLogout: () => void
}

export function TemporaryLogoutButton({
  isDisabled = false,
  onLogout,
}: TemporaryLogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isDisabled}
      className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left transition enabled:hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <p className="text-sm font-semibold text-rose-700">Temporary logout</p>
      <p className="mt-1 text-xs text-rose-500">
        Sign out from the current driver session.
      </p>
    </button>
  )
}
