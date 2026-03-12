type AssignedRouteOverflowButtonProps = {
  isOpen: boolean
  onClick: () => void
}

export function AssignedRouteOverflowButton({
  isOpen,
  onClick,
}: AssignedRouteOverflowButtonProps) {
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close route options' : 'Open route options'}
      className="flex h-10 w-10 pr-2 shrink-0 items-center justify-center rounded-full text-white transition active:scale-[0.98]"
      onClick={onClick}
      type="button"
    >
      <span className="flex flex-col gap-1">
        <Circle/>
        <Circle/>
        <Circle/>
      </span>
    </button>
  )
}

const Circle = () => {
  return ( 
    <span className="h-1 w-1 rounded-full bg-[rgb(var(--bg-strong-light))]" />
   );
}
 
