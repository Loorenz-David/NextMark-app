import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from 'react'

import { CheckMarkIcon, CloseIcon, InfoIcon,  WarningIcon, TriangleWarningIcon } from '../../../assets/icons'

import type { MessageStatus } from '../MessageHandlerContext'

const STATUS_STYLES: Record<
  MessageStatus,
  {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    container: string
  }
> = {
  success: {
    icon: CheckMarkIcon,
    container: 'bg-emerald-600/95 ring-emerald-400/60',
  },
  warning: {
    icon: TriangleWarningIcon,
    container: 'bg-amber-500/95 ring-amber-300/60',
  },
  error: {
    icon: WarningIcon,
    container: 'bg-rose-600/95 ring-rose-400/60',
  },
  info: {
    icon: InfoIcon,
    container: 'bg-sky-600/95 ring-sky-400/60',
  },
}

interface MessageCardProps {
  status: MessageStatus
  message: string
  details?: string
  createdAt: number
  durationMs: number
  onDismiss: () => void
}

export function MessageCard({ status, message, details, createdAt, durationMs, onDismiss }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [progress, setProgress] = useState(0)
  const { icon: Icon, container } = STATUS_STYLES[status]
  const hasDetails = Boolean(details)
  const isTruncated = message.length > 150
  const canExpand = hasDetails || isTruncated
  const displayText = useMemo(() => {
    if (isExpanded || message.length <= 150) {
      return message
    }
    return `${message.slice(0, 150)}…`
  }, [isExpanded, message])

  const toggleExpanded = () => {
    if (!canExpand) return
    setIsExpanded((prev) => !prev)
  }

  useEffect(() => {
    if (!durationMs) return
    let animationFrameId = 0
    const update = () => {
      const elapsed = Date.now() - createdAt
      const next = Math.min(1, Math.max(0, elapsed / durationMs))
      setProgress(next)
      if (next < 1) {
        animationFrameId = window.requestAnimationFrame(update)
      }
    }
    animationFrameId = window.requestAnimationFrame(update)
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [createdAt, durationMs])

  const ringSize = 26
  const ringStroke = 2
  const ringRadius = (ringSize - ringStroke) / 2
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progress)

  return (
    <div className="pointer-events-auto">
      <div
        className={`relative w-full rounded-2xl px-4 py-3 text-white shadow-2xl ring-1 transition ${container} ${
          canExpand ? 'cursor-pointer' : ''
        }`}
        onClick={toggleExpanded}
        role={canExpand ? 'button' : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-expanded={canExpand ? isExpanded : undefined}
        onKeyDown={(event) => {
          if (!canExpand) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleExpanded()
          }
        }}
      >
        <div className="flex items-center gap-3 pr-6">
          <Icon className="app-icon-white mt-0.5 h-5 w-5 shrink-0 text-white" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-medium leading-snug">{displayText}</p>
            {hasDetails && isExpanded && <p className="text-xs leading-relaxed text-white/90">{details}</p>}
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss message"
          className="absolute right-3 top-2 rounded-full p-1 text-white/80 transition hover:bg-white/15 hover:text-white"
          onClick={(event) => {
            event.stopPropagation()
            onDismiss()
          }}
        >
          <span className="relative flex h-6 w-6 items-center justify-center cursor-pointer">
            <svg
              className="absolute inset-0 h-6 w-6"
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
            >
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={ringStroke}

              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth={ringStroke}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </svg>
            <CloseIcon className=" h-4 w-4 text-[var(--color-page)]"
            
            />
          </span>
        </button>
      </div>
    </div>
  )
}
