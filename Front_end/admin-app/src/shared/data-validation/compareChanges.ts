
import isEqual from 'lodash/isEqual'
import type { RefObject } from 'react'

export const hasFormChanges = <T,>(
    form:T, 
    ref: RefObject<T | null>
)=>{
    // No snapshot yet means bootstrap is still establishing baseline.
    // Treat as unchanged to avoid false unsaved-change prompts on first open.
    if ( !ref.current ) return false

    return !isEqual( form, ref.current )
}

export const areObjectsEqual = <T,>(first: T, second: T) => {
    return isEqual(first, second)
}
