import { RouteGroupRailAvatar } from './RouteGroupRailAvatar'
import type { RouteGroupRailItem } from './types'

type RouteGroupRailProps = {
  items: RouteGroupRailItem[]
  onClick: (item: RouteGroupRailItem) => void
}

export const RouteGroupRail = ({
  items,
  onClick,
}: RouteGroupRailProps) => {
  return (
    <aside className="h-full w-full md:w-[100px] md:min-w-[100px] md:max-w-[100px]">
      <div className="flex h-full flex-row gap-2 overflow-x-auto px-3 py-3 md:flex-col md:overflow-x-visible md:overflow-y-auto md:px-2">
        {items.map((item) => (
          <RouteGroupRailAvatar
            key={item.route_group_id}
            item={item}
            onClick={onClick}
          />
        ))}
      </div>
    </aside>
  )
}
