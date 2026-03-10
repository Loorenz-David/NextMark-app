import { useState } from "react"

interface PropsUseCloseGuard{
    onRequestClose: ()=>void
}

export const useCloseGuard = ({onRequestClose}: PropsUseCloseGuard)=>{
    const [ confirmBeforeClosing, setConfirmBeforeClosing ] = useState<(()=> boolean) | null > ( null )
    const [ closeState, setCloseState ] = useState<'idle' | 'confirming'>( 'idle' )

 
    const cancelClose = ()=>{
        setCloseState('idle')
    }
    const confirmClose = ()=>{
        setCloseState( 'idle' )
        onRequestClose()
    }

    const closePopup = () =>{
        
        if ( !confirmBeforeClosing ){
            onRequestClose()
            return
        }
        if ( confirmBeforeClosing?.() ){
            onRequestClose()
            return
        }
        setCloseState('confirming')
    }

    const registerCloseGuard = (fn: ()=> boolean)=>{
        setConfirmBeforeClosing(() => fn)
        return ()=> setConfirmBeforeClosing( null )
    }

    const clearCloseGuard = ()=>{
        setConfirmBeforeClosing(null)
    }

    return {
        closeState,
        closePopup,
        registerCloseGuard,
        clearCloseGuard,
        confirmBeforeClosing,
        cancelClose,
        confirmClose,
    }
}