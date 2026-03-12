type FormatRouteDateRangeDependencies = {
  startDate: string | null
  endDate: string | null
}

function formatDate(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export function formatRouteDateRange({
  startDate,
  endDate,
}: FormatRouteDateRangeDependencies) {
  const formattedStartDate = formatDate(startDate)
  const formattedEndDate = formatDate(endDate)

  if (!formattedStartDate && !formattedEndDate) {
    return 'Schedule unavailable'
  }

  if (!formattedEndDate || formattedStartDate === formattedEndDate) {
    return formattedStartDate ?? formattedEndDate ?? 'Schedule unavailable'
  }

  if (!formattedStartDate) {
    return formattedEndDate
  }

  return `${formattedStartDate} - ${formattedEndDate}`
}
