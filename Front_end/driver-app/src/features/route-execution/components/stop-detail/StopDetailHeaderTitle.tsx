type StopDetailHeaderTitleProps = {
  streetAddress: string
  stopMeta: string
}

export function StopDetailHeaderTitle({
  streetAddress,
  stopMeta,
}: StopDetailHeaderTitleProps) {
  return (
    <div className="min-w-0">
      <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-white">
        {streetAddress}
      </h2>
      <p className="mt-1 text-sm text-white/65">
        {stopMeta}
      </p>
    </div>
  )
}
