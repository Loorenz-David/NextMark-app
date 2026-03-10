// PopupProvider.tsx
import { useEffect, useState } from 'react'
import { PopupContextProvider } from './PopupContext'
import { useCloseGuard } from './useCloseGuard'
import type { parentParams, PropsHeaderConfig } from './MainPopup.types'
import { useMobile } from '@/app/contexts/MobileContext'



type PropsPopupProvider = {
    children: React.ReactNode
    onRequestClose: () => void
    parentParams?: parentParams

}

export const MainPopupProvider = ({ children, onRequestClose, parentParams }: PropsPopupProvider) => {
  const [headerConfig, setPopupHeader] = useState<PropsHeaderConfig | null>(null)

  const {isMobile} = useMobile()
  const closeGuards = useCloseGuard({ onRequestClose })

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeGuards.closePopup()
    }
  }
  useEffect(() => {
    if(!isMobile){
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeGuards, isMobile])

  return (
    <PopupContextProvider
      value={{
        headerConfig,
        setPopupHeader,
        parentParams,
        ...closeGuards
      }}
    >
      {children}
    </PopupContextProvider>
  )
}