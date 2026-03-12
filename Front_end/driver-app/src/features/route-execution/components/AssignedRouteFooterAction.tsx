

type AssignedRouteFooterActionProps = {
  label: string
  placement?: 'flow' | 'bottom-fixed'
}

export function AssignedRouteFooterAction({
  label,
  placement = 'flow',
}: AssignedRouteFooterActionProps) {
  return (
    <section className={`px-5 ${placement === 'bottom-fixed' ? 'mt-auto flex-1 pb-10 pt-6' : 'mt-auto flex-1 pb-10 pt-12'}`}>
      <button
        className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/35 bg-white/6 px-4 text-base font-semibold text-cyan-300"
        type="button"
      >


        {label}
      </button>
    </section>
  )
}
