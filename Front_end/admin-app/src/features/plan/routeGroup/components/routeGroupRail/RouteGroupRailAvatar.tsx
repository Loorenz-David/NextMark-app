import type { RouteGroupRailItem } from './types'

type RouteGroupRailAvatarProps = {
  item: RouteGroupRailItem
  onClick: (item: RouteGroupRailItem) => void
}

export const RouteGroupRailAvatar = ({
  item,
  onClick,
}: RouteGroupRailAvatarProps) => {
  return (
    <button
      type="button"
      className={`flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-light-blue-r),0.55)] ${
        item.isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
      }`}
      onClick={() => onClick(item)}
    >
      <span
        aria-hidden="true"
        className={`block h-12 w-12 rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_22px_rgba(29,74,102,0.14)] ${
          item.isActive
            ? 'border-[rgb(var(--color-light-blue-r),0.58)] bg-[rgba(172,228,244,0.2)]'
            : 'border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgba(172,228,244,0.12)]'
        }`}
      />
      <span className={`line-clamp-2 text-xs font-medium leading-4 ${
        item.isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text)]/80'
      }`}>
        {item.label}
      </span>
    </button>
  )
}
