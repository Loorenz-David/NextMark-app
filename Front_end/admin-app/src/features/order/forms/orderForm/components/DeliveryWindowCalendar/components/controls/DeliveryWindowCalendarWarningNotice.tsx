type DeliveryWindowCalendarWarningNoticeProps = {
  message: string | null
  helperText: string
  compact?: boolean
}

export const DeliveryWindowCalendarWarningNotice = ({
  message,
  helperText,
  compact = false,
}: DeliveryWindowCalendarWarningNoticeProps) => {
  if (message) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}
      >
        {message}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <p className={`text-[var(--color-muted)] ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {helperText}
      </p>
    </div>
  )
}
