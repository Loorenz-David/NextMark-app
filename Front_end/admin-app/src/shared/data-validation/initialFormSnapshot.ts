
import type {  RefObject } from 'react'

export const makeInitialFormCopy = <T,>(
    ref:RefObject<T |null> , 
    form: T | null
)=>{
    if(!form) return
    ref.current = structuredClone( form )
}