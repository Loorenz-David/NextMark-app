type MenuButtonProps = {
  isOpen: boolean
  onClick: () => void
}

export function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(31,26,19,0.12)] bg-[rgba(255,253,250,0.94)] shadow-[0_18px_36px_rgba(31,26,19,0.14)] backdrop-blur-md transition-transform duration-200 hover:scale-[1.02]"
      onClick={onClick}
      type="button"
    >
      <span className="sr-only">{isOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
      <span className="flex flex-col gap-[0.28rem]">
        <span className="block h-[2px] w-6 rounded-full bg-[var(--text)]" />
        <span className="block h-[2px] w-6 rounded-full bg-[var(--text)]" />
        <span className="block h-[2px] w-6 rounded-full bg-[var(--text)]" />
      </span>
    </button>
  )
}
