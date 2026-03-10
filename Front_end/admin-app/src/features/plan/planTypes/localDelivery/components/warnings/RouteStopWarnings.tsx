import { useMemo, useState } from 'react'

import { TriangleWarningIcon } from '@/assets/icons'
import { FloatingPopover } from '@/shared/popups/FloatingPopover/FloatingPopover'
import type { RouteSolutionStop } from '@/features/plan/planTypes/localDelivery/types/routeSolutionStop'
import { formatRouteTime } from '@/features/plan/planTypes/localDelivery/utils/formatRouteTime'

type RouteStopWarningsProps = {
    stop?: RouteSolutionStop | null
    planStartDate?: string | null
}

export const RouteStopWarnings = ({ stop, planStartDate }: RouteStopWarningsProps) => {
    const [warningOpen, setWarningOpen] = useState(false)
    const constraintWarnings = useMemo(
        () => (Array.isArray(stop?.constraint_warnings) ? stop?.constraint_warnings ?? [] : []),
        [stop?.constraint_warnings],
    )
    const hasWarnings =
        Boolean(stop?.reason_was_skipped) ||
        constraintWarnings.length > 0 ||
        Boolean(stop?.has_constraint_violation)

    if (!hasWarnings) return null
    console.log(constraintWarnings)
    return (
        <FloatingPopover
            open={warningOpen}
            onOpenChange={setWarningOpen}
            classes="flex-none"
            offSetNum={6}
            reference={
                <div
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50"
                    onMouseEnter={() => setWarningOpen(true)}
                    onMouseLeave={() => setWarningOpen(false)}
                >
                    <TriangleWarningIcon className="h-4 w-4 text-amber-600" />
                </div>
            }
        >
            <div
                className="w-64 rounded-xl border border-[var(--color-border)] bg-white p-3 text-xs shadow-lg"
                onMouseEnter={() => setWarningOpen(true)}
                onMouseLeave={() => setWarningOpen(false)}
            >
                {stop?.reason_was_skipped && (
                    <div className="mb-3">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wide text-amber-700">
                            Skipped
                        </div>
                        <div className="mt-1 text-[0.75rem] text-[var(--color-text)]">
                            {stop.reason_was_skipped}
                        </div>
                    </div>
                )}
                {(constraintWarnings.length > 0 || stop?.has_constraint_violation) && (
                    <div className="space-y-2">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wide text-red-600">
                            Violation
                        </div>
                        {constraintWarnings.length === 0 && (
                            <div className="rounded-lg bg-[var(--color-primary)]/5 p-2 text-[0.75rem] text-[var(--color-text)]">
                                Constraint violation detected.
                            </div>
                        )}
                        {constraintWarnings.map((warning, index) => {
                            const payload = warning as ConstraintWarning
                            const meta = buildWarningMeta(payload, planStartDate)
                            return (
                                <div
                                    key={`${payload.type ?? 'warning'}-${index}`}
                                    className="rounded-lg bg-[var(--color-primary)]/5 p-2"
                                >
                                    <div className="text-[0.75rem] font-medium text-[var(--color-text)]">
                                        {payload.message ?? 'Constraint violation'}
                                    </div>
                                    {meta.length > 0 && (
                                        <div className="mt-1 space-y-1 text-[0.7rem] text-[var(--color-muted)]">
                                            {meta.map((item) => (
                                                <div key={item.label} className="flex w-full justify-between">
                                                    <span>{item.label}:</span>
                                                    <span>{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </FloatingPopover>
    )
}

type ConstraintWarning = {
    type?: string
    severity?: string
    message?: string
    expected_time?: string
    allowed_start?: string
    allowed_end?: string
    slack_minutes?: number
    route_expected_end?: string
    route_allowed_end?: string
}

const buildWarningMeta = (warning: ConstraintWarning, planStartDate?: string | null) => {
    const meta: Array<{ label: string; value: string }> = []
    if (warning.expected_time) {
        meta.push({
            label: 'Expected arrival time',
            value: formatRouteTime(warning.expected_time, planStartDate, true),
        })
    }
    if (warning.allowed_start) {
        meta.push({
            label: 'Allowed start',
            value: formatRouteTime(warning.allowed_start, planStartDate, true),
        })
    }
    if (warning.allowed_end) {
        meta.push({
            label: 'Allowed end',
            value: formatRouteTime(warning.allowed_end, planStartDate, true),
        })
    }
    if (typeof warning.slack_minutes === 'number') {
        meta.push({ label: 'Slack (min)', value: warning.slack_minutes.toString() })
    }
    if (warning.route_expected_end) {
        meta.push({
            label: 'Route expected end',
            value: formatRouteTime(warning.route_expected_end, planStartDate,  true),
        })
    }
    if (warning.route_allowed_end) {
        meta.push({
            label: 'Route allowed end',
            value: formatRouteTime(warning.route_allowed_end, planStartDate, true),
        })
    }
    return meta
}
