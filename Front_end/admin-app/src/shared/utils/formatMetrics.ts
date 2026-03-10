
export const formatMetric = (value: number, unit: 'kg' | '㎥') => {
    const rounded = Number.isFinite(value) ? Number(value.toFixed(2)) : 0
    return `${rounded} ${unit}`
}